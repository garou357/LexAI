const express = require('express')
const multer = require('multer')
const { pool } = require('../db')
const { authenticateToken } = require('../middleware/auth')
const { extractTextWithPages } = require('../services/pdf')
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

    // 2. Extract Text Page by Page
    const pages = await extractTextWithPages(buffer)
    const fullText = pages.map(p => p.text).join('\n')

    // 3. Summarize & Extract Clauses (AI tasks)
    const summary = await summarizeContract(fullText)
    const clauses = await extractClauses(fullText)

    // 4. Chunk & Embed per page
    let chunkCount = 0
    for (const pageData of pages) {
      const pageChunks = chunkText(pageData.text)
      
      const BATCH_SIZE = 20 // Smaller batches for per-page processing
      for (let i = 0; i < pageChunks.length; i += BATCH_SIZE) {
        const batch = pageChunks.slice(i, i + BATCH_SIZE)
        await Promise.all(batch.map(async (chunk, j) => {
          const embedding = await embedText(chunk)
          await pool.query(
            `INSERT INTO chunks (document_id, chunk_index, page_number, chunk_text, embedding, tsv)
             VALUES ($1, $2, $3, $4, $5, to_tsvector('english', $4))`,
            [documentId, chunkCount++, pageData.page, chunk, JSON.stringify(embedding)]
          )
        }))
      }
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
