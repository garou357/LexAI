const OpenAI = require('openai')
require('dotenv').config()

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const embedText = async (text) => {
  const res = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  })
  return res.data[0].embedding
}

const streamAnswer = async (question, contextChunks) => {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    stream: true,
    messages: [
      {
        role: 'system',
        content: 'You are a legal contract analyst. Your task is to provide accurate answers based on the provided contract context. If the user asks for a summary or what the contract is about, use the provided context to explain its purpose. If the answer is absolutely not in the context, say "I could not find that in the contract."'
      },
      {
        role: 'user',
        content: `Context:\n${contextChunks.join('\n\n')}\n\nQuestion: ${question}`
      }
    ]
  })

  return stream
}

module.exports = { embedText, streamAnswer }