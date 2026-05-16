const express = require('express')
const { pool } = require('../db')
const { authenticateToken } = require('../middleware/auth')

const router = express.Router()

router.get('/documents', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT d.id, d.filename, d.created_at, COUNT(c.id)::int as chunks
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
