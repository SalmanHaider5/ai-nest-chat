# AI Chatbot Backend

Backend API for an enterprise-ready AI Chatbot / AI Workspace built with **NestJS, TypeScript, and modern LLM technologies**.

The project is being developed incrementally, starting with a local LLM using **Ollama** and evolving toward RAG, AI agents, and AWS Bedrock.

## Overview

This backend powers the AI Workspace frontend and provides the foundation for:

* Conversational AI
* Local LLM integration
* Chat history and persistence
* Retrieval-Augmented Generation (RAG)
* Document ingestion and knowledge bases
* AI agents and tool calling
* Streaming AI responses
* Multiple LLM providers
* AWS Bedrock integration
* Enterprise-oriented AI architecture

The goal is not simply to build a chatbot, but to explore how a production-oriented **GenAI application platform** can be designed and evolved.

## Architecture

Current high-level architecture:

```text
┌─────────────────────────┐
│   Next.js Frontend      │
│   React + TypeScript    │
└────────────┬────────────┘
             │ HTTP
             ▼
┌─────────────────────────┐
│   NestJS Backend        │
│   TypeScript            │
├─────────────────────────┤
│ Chat API                │
│ AI Services             │
│ LLM Provider Layer      │
│ Persistence             │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│        Ollama           │
│       Local LLM         │
└─────────────────────────┘
```

The architecture will gradually evolve toward:

```text
Frontend
   │
   ▼
NestJS API
   │
   ├── Chat
   ├── AI
   ├── LLM Providers
   ├── RAG
   ├── Agents
   └── Knowledge
         │
         ▼
   PostgreSQL + pgvector
         │
         ▼
      LangChain
         │
         ▼
      LangGraph
         │
         ▼
    AWS Bedrock
```

## Technology Stack

### Backend

* NestJS
* TypeScript
* Node.js
* REST APIs
* Jest / Vitest
* ESLint / Oxlint

### AI

* Ollama
* Large Language Models (LLMs)
* LangChain
* LangGraph
* RAG
* Embeddings
* Vector Search
* Tool Calling
* AI Agents
* AWS Bedrock

### Data & Infrastructure

Planned:

* PostgreSQL
* pgvector
* Prisma
* Redis
* Docker
* Kubernetes
* AWS

## Project Structure

The backend is organized around domain-oriented NestJS modules.

```text
src/
├── modules/
│   └── chats/
│       ├── chats.controller.ts
│       ├── chats.service.ts
│       ├── chats.repository.ts
│       ├── chats.module.ts
│       └── dto/
│
├── ai/
│   ├── ai.service.ts
│   ├── providers/
│   │   └── ollama.provider.ts
│   └── ai.module.ts
│
└── app.module.ts
```

The structure will evolve as additional capabilities are introduced.

## Environment Configuration

Create a local `.env` file based on `.env.example`.

Example:

```env
NODE_ENV=development
PORT=4000

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

Never commit `.env` or credentials to the repository.

## Getting Started

### Prerequisites

* Node.js 24+
* Yarn
* Ollama

### Install dependencies

```bash
yarn install
```

### Configure environment

```bash
cp .env.example .env
```

On Windows, the `.env` file can also be created manually from `.env.example`.

### Start the development server

```bash
yarn start:dev
```

The API will run on:

```text
http://localhost:4000
```

## Development Roadmap

### Phase 1 — Backend Foundation

* [x] NestJS application
* [x] TypeScript
* [x] Git/GitHub
* [ ] Environment configuration
* [ ] Health check endpoint
* [ ] Global configuration module
* [ ] API structure

### Phase 2 — Chat API

* [ ] Chat endpoints
* [ ] Message model
* [ ] Request validation
* [ ] Chat state management
* [ ] Streaming responses

### Phase 3 — LLM Integration

* [ ] LLM provider abstraction
* [ ] Ollama integration
* [ ] Model configuration
* [ ] Prompt management
* [ ] Error handling
* [ ] Token/usage tracking

### Phase 4 — Persistence

* [ ] PostgreSQL
* [ ] Prisma
* [ ] Chat persistence
* [ ] Message persistence
* [ ] Redis
* [ ] Conversation caching

### Phase 5 — RAG

* [ ] Document upload
* [ ] Document processing
* [ ] Chunking
* [ ] Embeddings
* [ ] pgvector
* [ ] Semantic search
* [ ] Source citations

### Phase 6 — AI Agents

* [ ] Tool calling
* [ ] LangChain
* [ ] LangGraph
* [ ] Agent workflows
* [ ] Multi-step reasoning workflows
* [ ] Human-in-the-loop workflows

### Phase 7 — AWS / Production AI

* [ ] AWS Bedrock
* [ ] Provider abstraction
* [ ] Cloud deployment
* [ ] Observability
* [ ] Security
* [ ] Production architecture

## Related Project

Frontend:

**AI Chat Workspace**

The frontend is built with Next.js, React, TypeScript, and Ant Design.

## Goals

This project is being built as a hands-on exploration of modern **Generative AI application architecture**, with emphasis on:

* Production-oriented backend design
* LLM integration
* RAG architecture
* Agentic workflows
* Provider abstraction
* Cloud AI architecture
* Enterprise application patterns

The implementation intentionally evolves from a simple local chatbot into a more capable AI application platform.
