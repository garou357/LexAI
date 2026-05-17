# LexAI - Legal Contract Analyst ⚖️🤖

**Live Demo:** [https://lex-ai-app.vercel.app/](https://lex-ai-app.vercel.app/)

LexAI is an enterprise-grade **Retrieval-Augmented Generation (RAG)** application designed to transform how individuals and businesses interact with legal documents. It acts as an intelligent assistant that helps you understand, query, and compare complex contracts in seconds.

---

## 🌟 What LexAI Does
LexAI takes the "headache" out of legal paperwork by providing:
- **Instant Ingestion**: Upload PDF or DOCX contracts and let the AI process them in the background.
- **Smart Summaries**: Get a "Plain English" overview of any contract the moment it's uploaded.
- **Clause Extraction**: Automatically identifies and highlights critical terms like *Payment*, *Termination*, *Liability*, and *Confidentiality*.
- **Semantic Chat**: Ask questions about your document (e.g., "What is the notice period for termination?") and get accurate, cited answers.
- **Document Comparison**: Select any two contracts to generate a comparative risk report, identifying which is more "pro-vendor" or "pro-client."
- **Citation Tracking**: Every AI answer includes specific page citations (e.g., `[Page 4]`) so you can verify facts instantly.
- **Exportable Reports**: Download your entire Q&A history as a professionally formatted PDF report.

---

## 💡 Why LexAI?
Legal documents are notoriously dense, long, and filled with "legalese" that can be intimidating or intentionally confusing. Most people sign contracts without fully understanding the risks, durations, or hidden obligations.

**The Idea**: I built LexAI to democratize legal understanding. By combining modern AI with robust backend engineering, LexAI provides a transparent, easy-to-use tool that "reads between the lines," making legal clarity accessible to everyone, not just lawyers.

---

## 👨‍🏫 LexAI in Laymen's Terms
Imagine you have a high-priced legal expert sitting right next to you. Whenever you get a 50-page contract, you hand it to them, and in 10 seconds, they give you a one-page "cheat sheet" of exactly what matters. 

Then, you can talk to them. You ask, *"Hey, what happens if I want to cancel this next year?"* They don't just give you an answer; they point their finger at the exact paragraph on Page 12 that explains it. Finally, if you have two different versions of a deal, they tell you exactly how they differ. 

**LexAI is that expert, living in your browser.**

---

## 🛠️ Technical Architecture & Services
LexAI is built with a focus on high-performance backend engineering and data precision.

### **The Stack**
- **Frontend**: **React (Vite)** for a fast, responsive, and modern UI.
- **Icons**: **Lucide-React** for a clean, professional aesthetic.
- **Backend**: **Node.js & Express** managing a monolithic asynchronous event loop for high-concurrency document processing.
- **Database**: **PostgreSQL** with the **pgvector** extension.
- **AI Engine**: **OpenAI GPT-4o-mini** for reasoning and **text-embedding-3-small** for semantic understanding.

### **The "Special Sauce" (Advanced Engineering)**
- **Hybrid Search (RRF)**: Unlike basic AI apps, LexAI uses **Reciprocal Rank Fusion**. It runs two simultaneous searches—one for "meaning" (Vector) and one for "exact words" (Keyword)—and merges them for industry-leading accuracy.
- **HNSW Indexing**: Uses Hierarchical Navigable Small World indexes in PostgreSQL for lightning-fast similarity searches, even with thousands of document chunks.
- **Semantic Caching**: To save costs and reduce latency, LexAI "remembers" highly similar questions. If a similar question was answered before, it serves the cached result instantly.
- **JWT Multi-Tenancy**: Built with security in mind using **JSON Web Tokens** and **Bcrypt** hashing. Your documents and chats are private, secure, and accessible only to you.
- **Asynchronous Processing**: Uses an in-memory "fire-and-forget" model to handle heavy AI tasks without blocking the user experience.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (with `pgvector` installed)
- OpenAI API Key

### 2. Setup
1. Clone the repository.
2. Create a `.env` file in the `/server` directory:
   ```env
   DATABASE_URL=your_postgres_url
   OPENAI_API_KEY=your_openai_key
   PORT=3000
   ```
3. Install dependencies:
   ```bash
   # In /server
   npm install
   # In /client
   npm install
   ```

### 3. Run
1. Start the backend: `cd server && node src/index.js`
2. Start the frontend: `cd client && npm run dev`

---

Built with ❤️ for better legal transparency.
