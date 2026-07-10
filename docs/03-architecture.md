# Architecture

This document describes the high-level architecture of **Newsbit AI – Version 1** and explains how the different components interact.

---

# System Architecture

```text
                User
                  │
                  ▼
        Next.js Frontend
                  │
                  ▼
         FastAPI Backend
          │           │
          │           │
          ▼           ▼
    PostgreSQL     AI Service
          │           │
          │           ▼
          │         OpenAI
          │
          ▼
     News Provider
   (NewsAPI / GNews)
```

---

# Request Flow

## User Authentication

```text
User
    │
    ▼
Next.js
    │
    ▼
FastAPI
    │
    ▼
PostgreSQL
```

The backend handles user registration, login, password reset, and JWT authentication.

---

## AI News Flow

```text
User

↓

Next.js

↓

FastAPI

↓

News Service

↓

News Provider

↓

Fetch Top 10 News

↓

AI Service

↓

Generate AI Summaries

↓

Store Results

↓

Return Response

↓

Next.js

↓

Display News
```

When the user submits the predefined prompt **"Top 10 news today"**, the backend fetches the latest news, generates AI summaries, stores the processed articles, and returns them to the frontend.

---

# Components

## Frontend (Next.js)

Responsibilities:

- Display the AI input interface.
- Authenticate users.
- Send requests to the backend.
- Display the Top 10 news.
- Display AI-generated summaries.
- Display category, source, publication date, and original article links.

---

## Backend (FastAPI)

Responsibilities:

- Handle authentication.
- Validate incoming requests.
- Fetch news from external providers.
- Generate AI summaries.
- Store and retrieve articles.
- Return structured API responses.

---

## Database (PostgreSQL)

Responsibilities:

- Store user accounts.
- Store fetched news articles.
- Store AI-generated summaries.
- Prevent duplicate articles.
- Persist application data.

---

## News Service

Responsibilities:

- Connect to external news providers.
- Fetch today's top news.
- Validate article data.
- Normalize responses from different providers.

---

## AI Service

Responsibilities:

- Process fetched news articles.
- Generate concise AI summaries.
- Return structured summary data.
- Save generated summaries to the database.

---

# Design Principles

- Separation of concerns between frontend, backend, database, and AI services.
- AI logic remains on the backend.
- Frontend communicates only with backend APIs.
- External services are isolated behind service layers.
- Modular architecture to support future expansion.

---

# Version 1 Architecture Goal

The architecture should support the following workflow:

1. User logs in.
2. User submits the predefined prompt **"Top 10 news today"**.
3. Backend fetches today's top news.
4. AI generates concise summaries.
5. Results are stored in the database.
6. Frontend displays summarized news with category, source, and original article links.
