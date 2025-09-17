# Aurora — AI chat with live reasoning and memories

Aurora is a full‑stack AI chat application with authentication, streaming responses over WebSockets, and optional RAG-style long‑term memory using vector embeddings. It’s designed to be fast, clear, and easy to run locally.


## What Aurora does

- Chat with an AI assistant powered by Google Generative AI (Gemini) in real time.
- Keep a tidy list of conversations (create, rename, delete). Share a direct link to any chat.
- Get smooth typing/“Generating” feedback while the AI responds.
- Sign up and log in; sessions are maintained using an HttpOnly JWT cookie.
- Optional memory (RAG): each message is embedded and stored in Pinecone. Relevant memories from your history are retrieved to ground responses.


## Tech stack

- Frontend: React 19 + Vite, React Router v7, Redux Toolkit, react-hot-toast, react-markdown + remark-gfm, Socket.IO client
- Backend: Node.js + Express, Socket.IO server, Mongoose (MongoDB), bcryptjs, jsonwebtoken, cookie-parser, CORS
- AI & Vectors: @google/genai (Gemini 2.0 Flash), optional Pinecone for vector storage


## Architecture (high level)

- Client renders chats and messages, and connects to the server via Socket.IO
	- send message → emit `ai-message` to server
	- receive response → listen on `ai-response`
- Server receives `ai-message` and persists the user message
	- compute embeddings → upsert to Pinecone (if configured)
	- retrieve relevant memories → recent chat history + semantic matches
	- call Gemini with system persona + (memories + chat history)
	- emit `ai-response` to the same socket and persist the AI response (also embedded to Pinecone)
- REST endpoints handle auth and chat CRUD


## Repository layout

- `Backend/`
	- `server.js`: boots Express and Socket.IO on port 3000
	- `src/app.js`: Express app, CORS, static, routes
	- `src/routes/`: `auth.routes.js`, `chat.routes.js`
	- `src/controllers/`: auth and chat controllers
	- `src/middlewares/auth.middleware.js`: JWT cookie auth
	- `src/models/`: `user`, `chat`, `message` Mongoose schemas
	- `src/services/ai.service.js`: Gemini response + embeddings
	- `src/services/vector.service.js`: Pinecone integration (safe no-op if not configured)
	- `src/sockets/socket.server.js`: socket auth, message flow, RAG
- `Frontend/`
	- Vite React app with pages/components, Redux store, and Socket.IO client
	- Key components: `ChatSidebar`, `ChatMessages`, `ChatComposer`, modals, mobile bar


## Environment configuration

Create a `.env` in `Backend/` (values are examples; adjust for your setup):

```
MONGO_URI=mongodb://localhost:27017/aurora
JWT_SECRET=replace-with-a-strong-secret

# Google Generative AI SDK reads GOOGLE_API_KEY from env
GOOGLE_API_KEY=your-google-genai-key

# Optional: Pinecone for RAG memory (vectors)
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX=aiagent
```

Notes:
- The backend listens on port 3000.
- CORS is configured for `http://localhost:5173` (Vite default dev server).
- If Pinecone isn’t configured or errors during init, Aurora gracefully disables vector memory and still works.


## Run locally

1) Install dependencies

```
# Backend
cd Backend
npm install

# Frontend
cd ../Frontend
npm install
```

2) Start servers (in two terminals)

```
# Backend (http://localhost:3000)
cd Backend
npm start

# Frontend (http://localhost:5173)
cd Frontend
npm run dev
```

3) Open http://localhost:5173 and register/login to start chatting.


## API reference (REST)

Base URL: `http://localhost:3000`

Auth (cookie-based JWT)
- POST `/api/auth/register`
	- body: `{ fullName: { firstName, lastName }, email, password }`
	- sets `token` cookie
- POST `/api/auth/login`
	- body: `{ email, password }`
	- sets `token` cookie
- GET `/api/auth/me` (requires cookie)
	- response: `{ user: { _id, email, fullName } }`
- POST `/api/auth/logout`
	- clears `token` cookie

Chats (requires auth)
- POST `/api/chat`
	- body: `{ title }`
	- returns `{ chat: { _id, title, lastActivity, user } }`
- GET `/api/chat`
	- returns `{ chats: [ { _id, title, lastActivity, user }, ... ] }`
- GET `/api/chat/messages/:id`
	- returns `{ messages: [ { _id, chat, user, content, role, createdAt, ... }, ... ] }`
- PATCH `/api/chat/:id`
	- body: `{ title }`
	- updates a chat you own
- DELETE `/api/chat/:id`
	- deletes the chat and its messages


## Realtime (Socket.IO)

Namespace: default; connects to `http://localhost:3000` with credentials. The server authorizes via the `token` cookie.

Events
- Client → Server: `ai-message`
	- payload: `{ chat: string, content: string }`
- Server → Client: `ai-response`
	- payload: `{ chat: string, content: string }` (Markdown supported on the client)


## Data models (MongoDB via Mongoose)

- User
	- `{ email, fullName: { firstName, lastName }, passwordHash }`
- Chat
	- `{ user: ObjectId<User>, title, lastActivity }`
- Message
	- `{ user: ObjectId<User>, chat: ObjectId<Chat>, content, role: 'user'|'model'|'system' }`


## AI and memory

- Model: `gemini-2.0-flash` for generation, `gemini-embedding-001` for embeddings
- Persona: Aurora (friendly, concise, practical), applied via system instruction in `ai.service.js`
- Memory: embeddings are upserted to Pinecone with metadata `{ user, chat, text }` and queried on each turn to fetch relevant snippets
- Safety: If Pinecone isn’t available, memory calls no-op; chat still functions.


## RAG (Pinecone) — what’s used and how it works

What’s used
- Embeddings: `@google/genai` → `gemini-embedding-001` (768‑dim vectors)
- Vector DB: `@pinecone-database/pinecone` with index from `PINECONE_INDEX`
- Code: `Backend/src/services/vector.service.js` (create/query), `Backend/src/sockets/socket.server.js` (orchestration)

How it works (request flow)
1. User sends a message → server persists it (`message.model`) and generates an embedding.
2. The vector is upserted to Pinecone via `createMemory({ values, metadata })` with metadata `{ user, chat, text }` and id = the message id.
3. Server queries Pinecone via `queryMemory({ queryVector, topK: 3, filter: { user } })` to fetch semantically similar past messages.
4. It builds the prompt with two parts:
	- LTM: a compact block of retrieved memory texts
	- STM: recent chat turns from MongoDB
5. Calls Gemini (`generateContent`) with the persona system prompt + LTM + STM.
6. Emits `ai-response` to the client and saves the AI message; its embedding is also stored to Pinecone.

Enable/disable
- Set `PINECONE_API_KEY` and `PINECONE_INDEX` to enable RAG. If keys are missing or errors occur, the vector service disables itself gracefully and the app continues without RAG.
- Tune retrieval with `topK` in `socket.server.js` (default 3).

Privacy note
- Stored vector metadata contains only `{ user, chat, text }` plus the message id as the vector id. Remove `text` from metadata if you prefer to keep raw text out of the vector store.


## Frontend UX highlights

- Clean, minimal chat layout with mobile sidebar toggle
- “Generating” typing indicator with shimmer placeholders for pending AI replies
- Sidebar chat actions: Share, Rename, Delete (Archive placeholder)
- Profile footer with a clear Log out button
- Toast notifications for key actions


## Configuration tips

- Ensure `MONGO_URI` points to a running MongoDB instance
- Set a strong `JWT_SECRET`
- Provide `GOOGLE_API_KEY` for the Generative AI SDK to work
- Pinecone is optional; set `PINECONE_API_KEY` and `PINECONE_INDEX` to enable memory


## Troubleshooting

- 401 on `/api/auth/me` → you’re not logged in or the cookie is missing; login again
- CORS errors → verify Frontend origin (5173) and Backend CORS settings in `Backend/src/app.js`
- No AI responses → check `GOOGLE_API_KEY`, server logs, and network tab; ensure the Socket.IO connection is established
- Memory not working → Pinecone keys/index must exist; logs will show “[vector] … disabled/failed” but app continues


## Roadmap (suggested)

- Archive chats (UI + API)
- Streaming token-by-token responses
- Per-user settings (temperature, system prompt)
- Theming improvements and accessibility passes


## Acknowledgements

- Google Generative AI (Gemini)
- Pinecone for vector storage
- Socket.IO, React, Vite, and the open-source ecosystem
