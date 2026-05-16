const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const initDb = async () => {
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      summary TEXT,
      clauses JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Ensure documents has all required columns
    DO $$ 
    BEGIN 
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='user_id') THEN
        ALTER TABLE documents ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='status') THEN
        ALTER TABLE documents ADD COLUMN status TEXT DEFAULT 'pending';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='summary') THEN
        ALTER TABLE documents ADD COLUMN summary TEXT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='clauses') THEN
        ALTER TABLE documents ADD COLUMN clauses JSONB;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS chunks (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
      chunk_text TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      embedding vector(1536),
      tsv tsvector -- Full-text search column
    );

    ALTER TABLE chunks ALTER COLUMN embedding TYPE vector(1536);

    -- Indexes for Speed & Accuracy
    CREATE INDEX IF NOT EXISTS idx_chunks_tsv ON chunks USING GIN(tsv);
    CREATE INDEX IF NOT EXISTS idx_chunks_hnsw ON chunks USING hnsw (embedding vector_cosine_ops);

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  console.log('DB ready')
}

module.exports = { pool, initDb }
