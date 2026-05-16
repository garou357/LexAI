const { getDocument } = require('pdfjs-dist/legacy/build/pdf.mjs')

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

module.exports = { extractText }
