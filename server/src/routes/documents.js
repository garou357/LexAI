const express = require('express')
const { pool } = require('../db')
const { authenticateToken } = require('../middleware/auth')
const { compareContracts } = require('../services/ai')

const PDFDocument = require('pdfkit')

const router = express.Router()

router.get('/documents/:id/export', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    
    // 1. Verify ownership and get filename
    const { rows: docs } = await pool.query('SELECT filename FROM documents WHERE id = $1 AND user_id = $2', [id, req.user.id])
    if (docs.length === 0) return res.status(404).json({ error: 'Document not found' })
    const filename = docs[0].filename

    // 2. Fetch messages
    const { rows: messages } = await pool.query(
      'SELECT role, content, created_at FROM messages WHERE document_id = $1 ORDER BY created_at ASC',
      [id]
    )

    // 3. Create PDF
    const doc = new PDFDocument()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=LexAI_Report_${filename.replace('.pdf', '')}.pdf`)
    doc.pipe(res)

    // Header
    doc.fontSize(24).fillColor('#3b82f6').text('LexAI Analysis Report', { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).fillColor('#64748b').text(`Document: ${filename}`, { align: 'center' })
    doc.text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
    doc.moveDown(2)

    // Messages
    messages.forEach(msg => {
      const isUser = msg.role === 'user'
      
      doc.fontSize(10).fillColor(isUser ? '#3b82f6' : '#10b981').text(isUser ? 'YOU' : 'LEXAI', { oblique: true })
      doc.fontSize(12).fillColor('#1e293b').text(msg.content)
      doc.moveDown()
      doc.strokeColor('#e2e8f0').moveTo(doc.x, doc.y).lineTo(550, doc.y).stroke()
      doc.moveDown()
    })

    doc.end()

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.post('/compare', authenticateToken, async (req, res) => {
  try {
    const { docId1, docId2 } = req.body
    if (!docId1 || !docId2) return res.status(400).json({ error: 'Two document IDs required' })

    // Fetch both documents and verify ownership
    const { rows: docs } = await pool.query(
      'SELECT id, filename, summary, clauses FROM documents WHERE id IN ($1, $2) AND user_id = $3',
      [docId1, docId2, req.user.id]
    )

    if (docs.length !== 2) return res.status(404).json({ error: 'One or both documents not found or access denied' })

    const docA = docs.find(d => d.id === parseInt(docId1))
    const docB = docs.find(d => d.id === parseInt(docId2))

    if (!docA.summary || !docB.summary) {
      return res.status(400).json({ error: 'Documents must be fully processed before comparison' })
    }

    const comparison = await compareContracts(docA, docB)
    res.json({ comparison })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/documents', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.id, d.filename, d.status, d.summary, d.clauses, d.created_at, COUNT(c.id)::int as chunks
      FROM documents d
      LEFT JOIN chunks c ON d.id = c.document_id
      WHERE d.user_id = $1
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `, [req.user.id])
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.get('/documents/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query(
      `SELECT m.role, m.content FROM messages m
       JOIN documents d ON m.document_id = d.id
       WHERE m.document_id = $1 AND d.user_id = $2
       ORDER BY m.created_at ASC`,
      [id, req.user.id]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.delete('/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { rowCount } = await pool.query('DELETE FROM documents WHERE id = $1 AND user_id = $2', [id, req.user.id])
    if (rowCount === 0) return res.status(403).json({ error: 'Forbidden' })
    res.json({ message: 'Document deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
