const express = require('express')
const { pool } = require('../db')
const { embedText, streamAnswer } = require('../services/ai')

const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

router.get('/ask', authenticateToken, async (req, res) => {
  try {
    const { q, docId } = req.query
    if (!q || !docId) return res.status(400).json({ error: 'Missing q or docId' })

    // 1. Verify document belongs to user
    const { rows: docCheck } = await pool.query(
      'SELECT id FROM documents WHERE id = $1 AND user_id = $2',
      [docId, req.user.id]
    )
    if (docCheck.length === 0) return res.status(403).json({ error: 'Forbidden: Document not found or access denied' })

    // 1.5 Embed the question
    const questionEmbedding = await embedText(q)

    // 2. Find top 10 most relevant chunks using cosine similarity
    const { rows } = await pool.query(
      `SELECT chunk_text FROM chunks
       WHERE document_id = $1
       ORDER BY embedding <=> $2::vector
       LIMIT 10`,
      [docId, JSON.stringify(questionEmbedding)]
    )

    if (rows.length === 0) return res.status(404).json({ error: 'No chunks found for this document' })

    const contextChunks = rows.map(r => r.chunk_text)

    // 2.5 Save User Message
    await pool.query(
      'INSERT INTO messages (document_id, role, content) VALUES ($1, $2, $3)',
      [docId, 'user', q]
    )

    // 3. Stream GPT answer back
    let fullAnswer = ''
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const stream = await streamAnswer(q, contextChunks)

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || ''
      if (token) {
        fullAnswer += token
        res.write(`data: ${token}\n\n`)
      }
    }

    // Save AI Message
    await pool.query(
      'INSERT INTO messages (document_id, role, content) VALUES ($1, $2, $3)',
      [docId, 'ai', fullAnswer]
    )

    res.write('data: [DONE]\n\n')
    res.end()

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router