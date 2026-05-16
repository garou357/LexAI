const express = require('express')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const { initDb } = require('./db')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  message: { error: 'Too many requests, please try again later.' }
})
app.use('/api/', limiter)

app.use('/api/auth', require('./routes/auth'))
app.use('/api', require('./routes/ingest'))
app.use('/api', require('./routes/ask'))
app.use('/api', require('./routes/documents'))

const PORT = process.env.PORT || 3000

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})