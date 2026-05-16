const express = require('express')
const multer = require('multer')
const { pool } = require('../db')
const { authenticateToken } = require('../middleware/auth')
const { extractText } = require('../services/pdf')
const { chunkText } = require('../services/chunker')
const { embedText, summarizeContract, extractClauses } = require('../services/ai')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// In-memory background processor
const processDocument = async (documentId, buffer) => {
  try {
    console.log(`[Processing] Started document ${documentId}`)
    
    // 1. Update status to processing
    await pool.query('UPDATE documents SET status = $1 WHERE id = $2', ['processing', documentId])

    // 2. Extract Text
    const text = await extractText(buffer)

    // 3. Summarize & Extract Clauses (AI tasks)
    const summary = await summarizeContract(text)
    const clauses = await extractClauses(text)

    // 4. Chunk & Embed
    const chunks = chunkText(text)
    const BATCH_SIZE = 50

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map(async (chunk, j) => {
        const idx = i + j
        const embedding = await embedText(chunk)
        await pool.query(
          `INSERT INTO chunks (document_id, chunk_index, chunk_text, embedding, tsv)
           VALUES ($1, $2, $3, $4, to_tsvector('english', $3))`,
          [documentId, idx, chunk, JSON.stringify(embedding)]
        )
      }))
    }

    // 5. Final update
    await pool.query(
      'UPDATE documents SET status = $1, summary = $2, clauses = $3 WHERE id = $4',
      ['completed', summary, JSON.stringify(clauses), documentId]
    )

    console.log(`[Processing] Finished document ${documentId}`)

  } catch (err) {
    console.error(`[Processing] Error processing document ${documentId}:`, err)
    await pool.query('UPDATE documents SET status = $1 WHERE id = $2', ['failed', documentId])
  }
}

router.post('/ingest', authenticateToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' })

    const { rows } = await pool.query(
      'INSERT INTO documents (filename, user_id, status) VALUES ($1, $2, $3) RETURNING id',
      [req.file.originalname, req.user.id, 'pending']
    )
    const documentId = rows[0].id

    // Start processing in the background (fire and forget) without blocking the HTTP response
    // We pass a clone of the buffer to be safe, although memoryStorage buffers are usually stable
    processDocument(documentId, req.file.buffer).catch(console.error)

    console.log(`[Queue-Simulator] Processing document ${documentId} for user ${req.user.id}`)

    res.json({ documentId, status: 'pending', filename: req.file.originalname })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
