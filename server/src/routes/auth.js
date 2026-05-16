const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { pool } = require('../db')
require('dotenv').config()

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    )

    const user = rows[0]
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })
    
    res.json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' })
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = rows[0]

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' })
    
    res.json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
