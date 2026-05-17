const { getDocument } = require('pdfjs-dist/legacy/build/pdf.mjs')

/**
 * Extracts text page by page to preserve page metadata.
 * Returns an array of { page: number, text: string }
 */
const extractTextWithPages = async (buffer) => {
  const pdf = await getDocument({ data: new Uint8Array(buffer) }).promise
  const pages = []
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map(item => item.str).join(' ')
    pages.push({ page: i, text })
  }
  
  return pages
}

module.exports = { extractTextWithPages }
