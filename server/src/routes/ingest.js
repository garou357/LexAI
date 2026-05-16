const express = require('express')
const multer = require('multer')
const { getDocument } = require('pdfjs-dist/legacy/build/pdf.mjs')
const { pool } = require('../db')
const { chunkText } = require('../services/chunker')
const { embedText } = require('../services/ai')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

const extractText = async (buffer) => {
  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise
  let text = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ') + '\n'
  }
  return text
}

router.post('/ingest', authenticateToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded' })

    console.log(`Processing: ${req.file.originalname} for user ${req.user.id}`)

    const text = await extractText(req.file.buffer)

    const { rows } = await pool.query(
      'INSERT INTO documents (filename, user_id) VALUES ($1, $2) RETURNING id',
      [req.file.originalname, req.user.id]
    )
    const documentId = rows[0].id

    const chunks = chunkText(text)
    console.log(`Split into ${chunks.length} chunks`)

    const BATCH_SIZE = 100

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)
    
    await Promise.all(batch.map(async (chunk, j) => {
        const idx = i + j
        const embedding = await embedText(chunk)
        await pool.query(
        `INSERT INTO chunks (document_id, chunk_index, chunk_text, embedding)
        VALUES ($1, $2, $3, $4)`,
        [documentId, idx, chunk, JSON.stringify(embedding)]
        )
    }))

    console.log(`Embedded chunks ${i + 1}–${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length}`)
    
    }

    res.json({ documentId, chunks: chunks.length, filename: req.file.originalname })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
