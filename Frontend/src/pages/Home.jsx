import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import NewChatModal from '../components/chat/NewChatModal.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import '../components/chat/ChatLayout.css';
// import { fakeAIReply } from '../components/chat/aiClient.js';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  // ensureInitialChat,
  startNewChat,
  selectChat,
  setInput,
  sendingStarted,
  sendingFinished,
  // addUserMessage,
  // addAIMessage,
  setChats
} from '../store/chatSlice.js';

const Home = () => {
  const dispatch = useDispatch();
  const chats = useSelector(state => state.chat.chats);
  const activeChatId = useSelector(state => state.chat.activeChatId);
  const input = useSelector(state => state.chat.input);
  const isSending = useSelector(state => state.chat.isSending);
  const [ sidebarOpen, setSidebarOpen ] = React.useState(false);
  const [ socket, setSocket ] = useState(null);
  const [ newChatOpen, setNewChatOpen ] = useState(false);
  const [ renameChat, setRenameChat ] = useState(null);
  const [ deleteChat, setDeleteChat ] = useState(null);
  const [ me, setMe ] = useState(null);
  const [ authChecking, setAuthChecking ] = useState(true);
  const navigate = useNavigate();

  // const activeChat = chats.find(c => c.id === activeChatId) || null;

  const [ messages, setMessages ] = useState([
    // {
    //   type: 'user',
    //   content: 'Hello, how can I help you today?'
    // },
    // {
    //   type: 'ai',
    //   content: 'Hi there! I need assistance with my account.'
    // }
  ]);

  const handleNewChat = async (title) => {
    if (!title) return;
    const response = await axios.post("https://attack-capital-assignment.onrender.com/api/chat", { title }, { withCredentials: true });
    getMessages(response.data.chat._id);
    dispatch(startNewChat(response.data.chat));
    setSidebarOpen(false);
    setNewChatOpen(false);
  toast.success('New chat created');
  };

  // Auth guard + initial wiring
  useEffect(() => {
    let s = null;
    (async () => {
      try {
        // Check auth first
        const meResp = await axios.get('https://attack-capital-assignment.onrender.com/api/auth/me', { withCredentials: true });
        setMe(meResp.data.user);

        // Load chats
        const chatsResp = await axios.get('https://attack-capital-assignment.onrender.com/api/chat', { withCredentials: true });
        dispatch(setChats(chatsResp.data.chats.reverse()));

        // Wire socket only for authenticated users
        s = io('https://attack-capital-assignment.onrender.com', { withCredentials: true });
        s.on('ai-response', (messagePayload) => {
          setMessages((prev) => [ ...prev, { type: 'ai', content: messagePayload.content } ]);
          dispatch(sendingFinished());
        });
        setSocket(s);
      } catch (e) {
        console.warn('Auth check failed', e);
        toast.error('Please login to continue');
        navigate('/login');
      } finally {
        setAuthChecking(false);
      }
    })();

  return () => { try { s?.disconnect?.(); } catch { /* ignore disconnect errors */ } };
  }, [dispatch, navigate]);

  const sendMessage = async () => {

    const trimmed = input.trim();
    console.log("Sending message:", trimmed);
    if (!trimmed || !activeChatId || isSending) return;
    dispatch(sendingStarted());

    const newMessages = [ ...messages, {
      type: 'user',
      content: trimmed
    } ];

    console.log("New messages:", newMessages);

    setMessages(newMessages);
    dispatch(setInput(''));

    socket.emit("ai-message", {
      chat: activeChatId,
      content: trimmed
    })

    // try {
    //   const reply = await fakeAIReply(trimmed);
    //   dispatch(addAIMessage(activeChatId, reply));
    // } catch {
    //   dispatch(addAIMessage(activeChatId, 'Error fetching AI response.', true));
    // } finally {
    //   dispatch(sendingFinished());
    // }
  }

  const getMessages = async (chatId) => {

   const response = await  axios.get(`https://attack-capital-assignment.onrender.com/api/chat/messages/${chatId}`, { withCredentials: true })

   console.log("Fetched messages:", response.data.messages);

   setMessages(response.data.messages.map(m => ({
     type: m.role === 'user' ? 'user' : 'ai',
     content: m.content
   })));

  }


if (authChecking) return null;

return (
  <div className="chat-layout minimal">
    <ChatMobileBar
      onToggleSidebar={() => setSidebarOpen(o => !o)}
  onNewChat={() => setNewChatOpen(true)}
    />
    <ChatSidebar
      chats={chats}
      activeChatId={activeChatId}
      onSelectChat={(id) => {
        dispatch(selectChat(id));
        setSidebarOpen(false);
        getMessages(id);
      }}
  onNewChat={() => setNewChatOpen(true)}
      onRenameChat={(chat) => setRenameChat(chat)}
  onDeleteChat={(chat) => setDeleteChat(chat)}
      user={me}
    onLogout={async () => {
        try {
          await axios.post('https://attack-capital-assignment.onrender.com/api/auth/logout', {}, { withCredentials: true });
          setMe(null);
      toast.success('Logged out');
      navigate('/login');
        } catch (e) {
          console.error('Failed to logout', e);
      toast.error('Logout failed');
        }
      }}
      open={sidebarOpen}
    />
    <main className="chat-main" role="main">
      {messages.length === 0 && (
        <div className="chat-welcome" aria-hidden="true">
          <div className="chip">Early Preview</div>
          <h1>Aurora</h1>
          <p>Ask anything. Paste text, brainstorm ideas, or get quick explanations. Your chats stay in the sidebar so you can pick up where you left off.</p>
        </div>
      )}
      <ChatMessages messages={messages} isSending={isSending} />
      {
        activeChatId &&
        <ChatComposer
          input={input}
          setInput={(v) => dispatch(setInput(v))}
          onSend={sendMessage}
          isSending={isSending}
        />}
    </main>
    <NewChatModal
      open={newChatOpen}
      onCancel={() => setNewChatOpen(false)}
      onCreate={handleNewChat}
    />
    <NewChatModal
      open={!!renameChat}
      onCancel={() => setRenameChat(null)}
      onCreate={async (title) => {
        try {
          await axios.patch(`https://attack-capital-assignment.onrender.com/api/chat/${renameChat._id}`, { title }, { withCredentials: true });
          const resp = await axios.get('https://attack-capital-assignment.onrender.com/api/chat', { withCredentials: true });
          dispatch(setChats(resp.data.chats.reverse()));
          toast.success('Chat renamed');
        } catch (e) {
          console.error('Failed to rename chat', e);
          toast.error('Rename failed');
        } finally {
          setRenameChat(null);
        }
      }}
      defaultValue={renameChat?.title || ''}
      modalTitle="Rename Chat"
      confirmLabel="Save"
    />
    <ConfirmModal
      open={!!deleteChat}
      title="Delete chat?"
      message="This chat and all its messages will be permanently removed."
      confirmLabel="Delete"
      onCancel={() => setDeleteChat(null)}
      onConfirm={async () => {
        try {
          await axios.delete(`https://attack-capital-assignment.onrender.com/api/chat/${deleteChat._id}`, { withCredentials: true });
          const resp = await axios.get('https://attack-capital-assignment.onrender.com/api/chat', { withCredentials: true });
          dispatch(setChats(resp.data.chats.reverse()));
          toast.success('Chat deleted');
        } catch (e) {
          console.error('Failed to delete chat', e);
          toast.error('Delete failed');
        } finally {
          setDeleteChat(null);
        }
      }}
    />
    {sidebarOpen && (
      <button
        className="sidebar-backdrop"
        aria-label="Close sidebar"
        onClick={() => setSidebarOpen(false)}
      />
    )}
  </div>
);
};

export default Home;
