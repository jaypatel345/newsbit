# Architecture Decisions

This document records the major technical decisions made during the development of **Newsbit AI**.

Each decision includes the chosen approach, the reasoning behind it, and the alternatives that were considered.

---

# Decision 1 — Frontend Framework

**Chosen**

Next.js

**Reason**

- Excellent React framework for production applications.
- Supports modern routing and server-side capabilities.
- Strong ecosystem and deployment support.
- Familiar technology for future development.

**Alternative**

React (Vite)

**Reason Rejected**

While simpler, Next.js provides a better long-term foundation for a production application.

---

# Decision 2 — Backend Framework

**Chosen**

FastAPI

**Reason**

- Excellent performance.
- Strong typing with Pydantic.
- Built-in OpenAPI documentation.
- Excellent ecosystem for AI applications.
- Clean project structure and dependency injection.

**Alternative**

Node.js (Express)

**Reason Rejected**

Express is well suited for general backend development, but FastAPI offers a stronger ecosystem for AI integrations and data validation.

---

# Decision 3 — Database

**Chosen**

PostgreSQL

**Reason**

- Reliable relational database.
- Strong support for structured data.
- Excellent scalability.
- Widely used in production environments.

**Alternative**

MongoDB

**Reason Rejected**

The application's data model is highly structured, making a relational database a better fit.

---

# Decision 4 — AI Provider

**Chosen**

Groq API

**Reason**

- Fast inference speed.
- Easy integration.
- Suitable for generating AI summaries.
- Supports multiple open-source language models.

**Alternative**

OpenAI API

**Reason Rejected**

Groq provides excellent performance and lower operational cost for the current project requirements.

---

# Decision 5 — Authentication

**Chosen**

JWT Authentication

**Reason**

- Stateless authentication.
- Easy integration with frontend applications.
- Industry-standard approach for REST APIs.

**Alternative**

Session-based authentication

**Reason Rejected**

JWT is better suited for a decoupled frontend and backend architecture.

---

# Decision 6 — AI Architecture

**Chosen**

Backend-only AI integration.

**Reason**

- Keeps API keys secure.
- Centralizes prompt management.
- Prevents direct client access to AI providers.
- Easier monitoring and logging.

**Alternative**

Frontend calling the AI provider directly.

**Reason Rejected**

Exposes API keys and tightly couples the frontend to the AI provider.

---

# Decision 7 — News Source

**Chosen**

NewsAPI

**Reason**

- Reliable news aggregation.
- Simple REST API.
- Supports top headlines and article search.
- Good documentation.

**Alternative**

Web scraping

**Reason Rejected**

More complex, less reliable, and introduces maintenance and legal considerations.

---

# Decision 8 — News Storage Strategy

**Chosen**

Store fetched articles in the database.

**Reason**

- Faster response times.
- Reduced external API usage.
- AI summaries are generated once and reused.
- Enables future features such as personalization and search.

**Alternative**

Fetch news from NewsAPI for every user request.

**Reason Rejected**

Slower responses, increased API usage, and repeated AI summarization.

---

# Decision 9 — Source Data Model

**Chosen**

Store `source_id` and `source_name` directly in the `Article` table.

**Reason**

- Simpler schema for Version 1.
- No need for joins.
- Meets current product requirements.

**Alternative**

Separate `Source` table.

**Reason Rejected**

Version 1 does not require source management, filtering, or source-specific pages.

---

# Decision 10 — AI Summary Storage

**Chosen**

Store AI-generated summaries in the database.

**Reason**

- Avoid repeated LLM calls.
- Lower AI costs.
- Faster user experience.
- Consistent summaries for all users.

**Alternative**

Generate summaries on every request.

**Reason Rejected**

Higher latency, increased API costs, and unnecessary repeated processing.

---

# Decision 11 — User Experience

**Chosen**

A single AI chat interface.

**Reason**

- Keeps the product simple.
- Allows future AI capabilities to be added without redesigning the interface.
- Creates a conversational experience instead of multiple disconnected pages.

**Alternative**

Separate pages for summaries, recommendations, and AI tools.

**Reason Rejected**

Adds unnecessary complexity and fragments the user experience.

---

# Decision 12 — Version 1 Scope

**Chosen**

Focus on one core workflow:

**"Top 10 news today."**

**Reason**

- Deliver one polished feature instead of many incomplete ones.
- Validate the product idea quickly.
- Build a strong technical foundation before adding advanced AI features.

**Alternative**

Implement bookmarks, search, recommendations, chat, and personalization from the beginning.

**Reason Rejected**

Would significantly increase complexity and slow down development without validating the core value of the product.

---

# Guiding Principle

For every new feature added to Newsbit AI, ask:

- Does it solve a real user problem?
- Does it fit the product vision?
- Can it be integrated into the existing AI chat experience?
- Does it justify the additional complexity?

If the answer is **no**, it should be postponed to a future version.
