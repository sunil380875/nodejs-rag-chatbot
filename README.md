# Local RAG System (Node.js + Qdrant + Ollama)

A robust, fully local Retrieval-Augmented Generation (RAG) API built with Node.js. It allows you to ingest documents (or video transcripts), generate embeddings, and ask questions against your uploaded context using powerful local LLMs.

## 🏗️ Architecture

This project is structured around the following core technologies:

- **Express.js**: The web framework for handling API routes and middleware.
- **Ollama**: Handles both embedding (`nomic-embed-text`) and chatting (`llama3`) entirely locally, without relying on external APIs like OpenAI.
- **Qdrant**: A high-performance vector database used to store and retrieve document embeddings efficiently.
- **Chunker Utility**: A custom text-splitting function that breaks down large documents into smaller semantic chunks with overlapping boundaries to preserve context.

### Workflow

1. **Ingestion (`/ingest` and `/ingest/pdf`)**:
   - The user submits text data or uploads a PDF file to the API.
   - For PDFs, the text is automatically extracted using `pdf-parse`.
   - The `chunkText` utility divides the text into smaller, manageable chunks.
   - The `nomic-embed-text` model via Ollama generates high-dimensional vector embeddings for each chunk.
   - These vectors, along with the original text payload and metadata, are saved into the Qdrant database.

2. **Querying (`/ask`)**:
   - The user asks a question.
   - The question is converted into a vector embedding using the same `nomic-embed-text` model.
   - Qdrant performs a similarity search, retrieving the top 3 most relevant text chunks from the ingested documents.
   - The retrieved context and the user's question are sent to `llama3` (via Ollama) with strict instructions to answer *only* based on the provided context.
   - The generated answer is formatted into a standardized API response and returned to the user.

## 🚀 API Endpoints

### 1. Ingest Document
* **Endpoint**: `POST /ingest`
* **Body**:
  ```json
  {
    "text": "Your large document text goes here...",
    "type": "text"
  }
  ```

### 2. Ingest PDF Document
* **Endpoint**: `POST /ingest/pdf`
* **Body**: `multipart/form-data`
  * `pdf`: (File) The PDF file to upload and process.

### 3. Ask Question
* **Endpoint**: `POST /ask`
* **Body**:
  ```json
  {
    "question": "What is the document about?"
  }
  ```

## 📂 Project Structure

- `app.js`: Main Express application configuration, middleware setup, and route aggregation.
- `controller/rag.controller.js`: Contains the core logic for the RAG ingestion and retrieval/chat workflows.
- `router/rag.routes.js`: Defines the API endpoints.
- `middlewares/errorHandler.js`: Centralized global error handling middleware.
- `utils/`: Contains helper classes like `ApiResponse`, `AppError`, `catchAsync`, and the `chunker.js` text splitting logic.
- `db/vectordb.js`: Configuration for connecting to the local Qdrant instance.

## 🛠️ Setup & Running

Ensure you have [Ollama](https://ollama.com/) running locally with the following models pulled:
```bash
ollama run llama3
ollama pull nomic-embed-text
```

You also need a running instance of Qdrant (typically via Docker).

Run the dev server:
```bash
npm run dev
```
