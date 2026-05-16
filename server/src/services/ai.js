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

const summarizeContract = async (text) => {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a legal expert. Provide a concise, 3-paragraph "plain English" summary of this contract. Focus on the parties, the main purpose, and the duration.'
      },
      {
        role: 'user',
        content: `Contract text (first 5000 chars):\n${text.substring(0, 5000)}`
      }
    ]
  })
  return res.choices[0].message.content
}

const extractClauses = async (text) => {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: "json_object" },
    messages: [
      {
        role: 'system',
        content: 'You are a legal expert. Extract the key clauses (Payment, Termination, Liability, Confidentiality) from this contract. Return a JSON object with these keys and a 1-sentence description for each.'
      },
      {
        role: 'user',
        content: `Contract text (first 5000 chars):\n${text.substring(0, 5000)}`
      }
    ]
  })
  return JSON.parse(res.choices[0].message.content)
}

module.exports = { embedText, streamAnswer, summarizeContract, extractClauses }