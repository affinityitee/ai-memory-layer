# 🧠 Bloom -AI Memory Layer for Chatbots

A RAG-based chatbot that remembers facts about a user across conversations, using vector embeddings and cosine similarity - no external vector database required.

## How it works

1. **Chat** -user sends a message; the system embeds it, searches stored memories by meaning (not keywords) using cosine similarity, and injects the most relevant facts into the AI's prompt.
2. **Background memory extraction** -after replying, the system separately checks whether the message contained a fact worth remembering, and silently saves a clean, distilled version if so - without making the user wait.
3. **Deduplication** -before saving, new facts are compared against existing memories by similarity; near-duplicates are skipped.

## Tech Stack

-**Frontend:** React (Vite)
-**Backend:** Node.js + Express
-**Database:** MongoDB Atlas (vectors stored as plain number arrays)
-**AI:** Gemini API (`gemini-embedding-001` for embeddings, `gemini-3.6-flash` for chat/extraction)
-**Similarity search:** hand-written cosine similarity, brute-force compared in JavaScript - no dedicated vector DB, since this is well within the scale where that's still fast

## Why brute-force similarity instead of a vector database?

At the scale of a single user's personal memory (hundreds, not millions, of entries), comparing against every stored vector in plain JavaScript is genuinely fast enough - sub-millisecond territory. A dedicated vector database (e.g. Pinecone, or MongoDB Atlas's paid vector search) would only become necessary at a much larger scale, and reaching for that infrastructure now would be premature optimization.

## Known Limitations / Future Scope

-**No contradiction handling** -if a user updates a fact (e.g. changes cities), the old and new facts are both stored as separate memories rather than one replacing the other, since they're not similar enough to be caught as duplicates.
-**No cap on memory growth per user** -retrieval currently scans every stored memory for a user; at very high volumes this would need a limit or a real indexed vector store.
-**No retry logic** on AI API calls -a transient failure currently fails the whole request rather than retrying.
-**No authentication** -`userId` is passed directly from the client with no verification; a real deployment would derive it from an authenticated session.

## Running locally

**Backend:**
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

**Frontend:**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Requires a `.env` file in `/backend`:
\`\`\`
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
\`\`\`



## Screenshots
#### 💬 Chat Interface — Bloom in Action
The main chat view, showing a live conversation alongside the memory sidebar.
<img width="1910" height="982" alt="image" src="https://github.com/user-attachments/assets/456e420d-f122-4b0b-a40b-02a6660356b4" />

#### 🗂️ Extracted Memories
Facts automatically distilled and stored from natural conversation - no manual tagging required.
<img width="1915" height="987" alt="image" src="https://github.com/user-attachments/assets/521851f2-32f1-49c3-bc5f-3257d71afc82" />

#### 🔬 RAG Retrieval in Action
Raw API response from `/api/chat`, showing a retrieved memory and its cosine similarity score - proof the system retrieves by meaning, not keywords.
<img width="1422" height="658" alt="image" src="https://github.com/user-attachments/assets/8c8af683-d8cb-4f99-9fbc-f80fbebde194" />
