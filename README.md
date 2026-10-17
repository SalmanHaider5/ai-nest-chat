# AI Chat Application

A ChatGPT-like application exploring LLM integration, conversation context management, summarization, and persistent memory.

## Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Backend:** NestJS, TypeScript
- **Database:** PostgreSQL, TypeORM
- **LLM Runtime:** Ollama
- **LLM Model:** Qwen3 1.7B
- **Infrastructure:** Docker

## How to Run

### Prerequisites

- Node.js
- Yarn
- Docker
- Ollama

### 1. Start the Database

Start the existing PostgreSQL container:

```bash
docker start ai-chat-postgres
```

### 2. Start Ollama

Pull the model if it is not already installed:

```bash
ollama pull qwen3:1.7b
```

Ensure Ollama is running and accessible to the backend.

### 3. Start the Backend

```bash
cd ai-nest-chat
yarn install
```

Configure the required environment variables for PostgreSQL and Ollama.

Run database migrations:

```bash
yarn typeorm-ts-node-esm migration:run -d src/database/data-source.ts
```

Start the backend:

```bash
yarn start
```

### 4. Start the Frontend

Open a separate terminal:

```bash
cd ai-next-chat
yarn install
yarn start
```

Open the local URL displayed in the terminal, usually `http://localhost:3000`.

## Implemented Features

- **LLM Integration:** Generates conversational responses using a locally running language model.
- **Conversation Management:** Supports multiple chats with persistent message history.
- **Context Management:** Constructs LLM context using the current message and relevant conversation history.
- **Conversation Summarization:** Summarizes older messages to reduce the amount of historical context sent to the LLM.
- **Summary Boundaries:** Tracks summarized messages to prevent repeatedly processing the same conversation history.
- **Recent Message Window:** Combines summaries with recent messages to preserve conversational continuity.
- **Fact Extraction:** Extracts structured facts from user messages using an LLM.
- **Persistent Memory:** Stores long-term user facts separately from temporary, chat-specific facts.
- **Memory Context Injection:** Includes relevant stored facts in the context provided to the LLM.
- **Direct Fact Lookup:** Attempts to answer certain fact-based questions directly from stored memory without generating a full LLM response.
- **Fact Scoping:** Separates global user facts from temporary facts associated with individual chats.

## What's Next

- **Embedding Vectors:** Understand how text is converted into numerical vectors representing semantic meaning.
- **Embedding Models:** Explore model selection, retrieval quality, latency, and cost.
- **Vector Storage:** Store and search embeddings using PostgreSQL with `pgvector`.
- **Semantic Search:** Retrieve relevant information based on meaning rather than exact keyword matching.
- **RAG (Retrieval-Augmented Generation):** Retrieve relevant document chunks and provide them to the LLM as context for grounded responses.
- **Document Ingestion:** Implement document loading, text extraction, chunking, and embedding generation.
- **Retrieval Optimization:** Explore metadata filtering, hybrid search, and reranking.
- **LangChain Integration:** Explore LangChain for organizing embedding, retrieval, and RAG workflows.
- **Evaluation and Optimization:** Measure retrieval accuracy, response quality, latency, and token usage.
