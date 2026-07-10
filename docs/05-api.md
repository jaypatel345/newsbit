# API Design

This document defines the REST APIs for **Newsbit AI – Version 1**.

The APIs are divided into two categories:

- Public APIs (used by the frontend)
- Internal APIs (used by background jobs and system processes)

---

# Public APIs

## Authentication

### Register User

**Endpoint**

```http
POST /api/v1/auth/register
```

**Purpose**

Create a new user account.

---

### Login User

**Endpoint**

```http
POST /api/v1/auth/login
```

**Purpose**

Authenticate the user and return a JWT access token.

---

### Forgot Password

**Endpoint**

```http
POST /api/v1/auth/forgot-password
```

**Purpose**

Initiate the password reset process.

---

### Reset Password

**Endpoint**

```http
POST /api/v1/auth/reset-password
```

**Purpose**

Allow the user to set a new password.

---

### Get Current User

**Endpoint**

```http
GET /api/v1/auth/me
```

**Purpose**

Return the profile information of the authenticated user.

---

# News

### Get Today's Top News

**Endpoint**

```http
GET /api/v1/news/top
```

**Purpose**

Return the latest Top 10 news articles stored in the database.

Each article includes:

- Title
- Description
- AI Summary
- Source Name
- Original Article URL
- Published Time

This endpoint is called when the user submits the predefined prompt:

> **Top 10 news today**

The frontend does not communicate directly with the NewsAPI or the LLM.

---

### Get Single Article

**Endpoint**

```http
GET /api/v1/news/{article_id}
```

**Purpose**

Return the complete information for a single article.

---

# Internal APIs

These endpoints are intended for scheduled jobs or internal services and are not called directly by the frontend.

---

### Fetch Latest News

**Endpoint**

```http
POST /api/v1/internal/news/fetch
```

**Purpose**

Fetch the latest news articles from the external News API.

Responsibilities:

- Request latest articles
- Validate response
- Remove duplicates
- Store new articles in the database

---

### Generate AI Summaries

**Endpoint**

```http
POST /api/v1/internal/news/summarize
```

**Purpose**

Generate AI summaries for articles that do not already have one.

Responsibilities:

- Find articles with missing summaries
- Send article content to the LLM
- Store generated summaries
- Skip articles that already contain a summary

---

# API Flow

```text
User
    │
    ▼
Login
    │
    ▼
Home Page
    │
    ▼
User enters:
"Top 10 news today"
    │
    ▼
GET /api/v1/news/top
    │
    ▼
Backend
    │
    ▼
Database
    │
    ▼
Return Top 10 Articles
    │
    ▼
Frontend Displays News
```

---

# Design Decisions

- The frontend communicates only with the FastAPI backend.
- The backend is responsible for interacting with external News APIs.
- AI summaries are generated on the backend and stored in the database.
- News is fetched and stored before users request it, ensuring faster responses and reducing external API and AI usage.
- Internal APIs are separated from public APIs to keep the architecture clean and maintainable.
