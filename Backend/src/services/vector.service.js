// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone')

// Optional Pinecone setup (disabled if no API key or on error)
const PINECONE_API_KEY = process.env.PINECONE_API_KEY
const PINECONE_INDEX = process.env.PINECONE_INDEX || 'aiagent'

let pineconeEnabled = Boolean(PINECONE_API_KEY)
let pc = null

if (pineconeEnabled) {
    try {
        pc = new Pinecone({ apiKey: PINECONE_API_KEY })
    } catch (e) {
        pineconeEnabled = false
        console.warn('[vector] Pinecone init disabled:', e?.message || e)
    }
}

function getIndex() {
    if (!pineconeEnabled || !pc) return null
    try {
        // Lazily obtain index; if it throws (e.g., 404), disable Pinecone gracefully
        return pc.Index(PINECONE_INDEX)
    } catch (e) {
        pineconeEnabled = false
        console.warn('[vector] Pinecone index disabled:', e?.message || e)
        return null
    }
}

async function createMemory({ vectors, metadata, messageId }) {
    const index = getIndex()
    if (!index) return // no-op when disabled
    try {
        await index.upsert([
            {
                id: messageId,
                values: vectors,
                metadata,
            },
        ])
    } catch (e) {
        console.warn('[vector] upsert failed:', e?.message || e)
    }
}

async function queryMemory({ queryVector, limit = 5, metadata }) {
    const index = getIndex()
    if (!index) return [] // safe default when disabled
    try {
        const data = await index.query({
            vector: queryVector,
            topK: limit,
            filter: metadata ? metadata : undefined,
            includeMetadata: true,
        })
        return data?.matches || []
    } catch (e) {
        console.warn('[vector] query failed:', e?.message || e)
        return []
    }
}

module.exports = { createMemory, queryMemory }