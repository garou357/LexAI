const chunkText = (text, size = 1000, overlap = 100) => {
  const chunks = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + size, text.length)
    chunks.push(text.slice(start, end).trim())
    start += size - overlap
  }

  return chunks.filter(c => c.length > 20) // drop tiny trailing chunks
}

module.exports = { chunkText }