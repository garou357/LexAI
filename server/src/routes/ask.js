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
    const embeddingStr = JSON.stringify(questionEmbedding)

    // 1.6 Semantic Cache Check
    // We look for previous AI answers to the same or very similar questions for this document
    // We look at the 'user' message immediately PRECEDING an 'ai' message
    const { rows: cacheHits } = await pool.query(
      `SELECT m2.content as answer
       FROM messages m1
       JOIN messages m2 ON m1.id = m2.id - 1
       WHERE m1.document_id = $1 
         AND m1.role = 'user' 
         AND m2.role = 'ai'
         AND m1.question_embedding <=> $2::vector < 0.05
       LIMIT 1`,
      [docId, embeddingStr]
    )

    if (cacheHits.length > 0) {
      console.log(`[Cache-Hit] Found similar question for doc ${docId}`)
      res.setHeader('Content-Type', 'text/event-stream')
      res.write(`data: ${cacheHits[0].answer}\n\n`)
      res.write('data: [DONE]\n\n')
      return res.end()
    }

    // 2. Hybrid Search using Reciprocal Rank Fusion (RRF)
    const { rows } = await pool.query(
      `WITH vector_search AS (
        SELECT id, row_number() OVER (ORDER BY embedding <=> $2::vector) as rank
        FROM chunks
        WHERE document_id = $1
        ORDER BY embedding <=> $2::vector
        LIMIT 20
      ),
      text_search AS (
        SELECT id, row_number() OVER (ORDER BY ts_rank_cd(tsv, plainto_tsquery('english', $3)) DESC) as rank
        FROM chunks
        WHERE document_id = $1 AND tsv @@ plainto_tsquery('english', $3)
        ORDER BY ts_rank_cd(tsv, plainto_tsquery('english', $3)) DESC
        LIMIT 20
      )
      SELECT 
        chunks.chunk_text,
        chunks.page_number,
        COALESCE(1.0 / (60 + vector_search.rank), 0) +
        COALESCE(1.0 / (60 + text_search.rank), 0) as rrf_score
      FROM chunks
      LEFT JOIN vector_search ON chunks.id = vector_search.id
      LEFT JOIN text_search ON chunks.id = text_search.id
      WHERE vector_search.id IS NOT NULL OR text_search.id IS NOT NULL
      ORDER BY rrf_score DESC
      LIMIT 10`,
      [docId, embeddingStr, q]
    )

    if (rows.length === 0) return res.status(404).json({ error: 'No chunks found for this document' })

    const contextChunks = rows.map(r => `[Page ${r.page_number}]: ${r.chunk_text}`)

    // 2.5 Save User Message (with embedding for future cache)
    await pool.query(
      'INSERT INTO messages (document_id, role, content, question_embedding) VALUES ($1, $2, $3, $4)',
      [docId, 'user', q, embeddingStr]
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