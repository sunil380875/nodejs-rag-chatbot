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
   - **Contextual Chunking**: Each chunk is analyzed by `llama3` to generate a brief summary of its context within the broader document. This context is prepended to the chunk.
   - The `nomic-embed-text` model via Ollama generates high-dimensional vector embeddings for each contextual chunk.
   - These vectors, along with the original text payload, the contextual text, and metadata, are saved into the Qdrant database.

2. **Querying (`/ask`)**:
   - The user asks a question.
   - The question is converted into a vector embedding using the `nomic-embed-text` model.
   - Qdrant performs a similarity search, retrieving the top 3 most relevant contextual chunks.
   - The retrieved context and the user's question are sent to `llama3` (via Ollama) with strict instructions to answer *only* based on the provided context.
   - The generated answer is formatted into a standardized API response and returned to the user.

## 🚀 API Endpoints & Payloads

### 1. Ingest Text Document
Ingests raw text strings into the RAG system.
* **Endpoint**: `POST /ingest`
* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "text": "Your large document text goes here...",
    "type": "text"
  }
  ```

### 2. Ingest PDF Document
Uploads a PDF file, extracts the text, and ingests it.
* **Endpoint**: `POST /ingest/pdf`
* **Headers**: `Content-Type: multipart/form-data`
* **Request Payload**:
  * `pdf`: (File) The PDF file to upload and process.

### 3. Ask Question
Queries the RAG system based on the ingested documents.
* **Endpoint**: `POST /ask`
* **Headers**: `Content-Type: application/json`
* **Request Payload**:
  ```json
  {
    "question": "What is the document about?"
  }
  ```
* **Success Response**:
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "response": "The document is about..."
    },
    "message": "Response fetched successfully"
  }
  ```

## 📂 Project Structure

- `app.js`: Main Express application configuration, middleware setup, and route aggregation.
- `controller/rag.controller.js`: Contains the core logic for the RAG ingestion and retrieval/chat workflows.
- `router/rag.routes.js`: Defines the API endpoints.
- `middlewares/`: Contains Multer configuration for file uploads and the centralized global error handler.
- `utils/`: Contains helper classes like `ApiResponse`, `AppError`, `catchAsync`, and the `chunker.js` text splitting logic.
- `db/vectordb.js`: Configuration for connecting to the local Qdrant instance.

## 🛠️ Setup & Running

### 1. Start Qdrant (Vector Database)
You must have Qdrant running locally via Docker. Run the following command in your terminal to start the Qdrant container and persist data in a local `qdrant_storage` folder:

```bash
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant
```

### 2. Setup Ollama (Local LLM)
Ensure you have [Ollama](https://ollama.com/) running locally with the following models pulled:
```bash
ollama run llama3
ollama pull nomic-embed-text
```

### 3. Start the Server
Run the dev server:
```bash
npm run dev
```
