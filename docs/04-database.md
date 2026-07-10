# Database

This document describes the database design for **Newsbit AI – Version 1**.

The goal of the database is to securely store user accounts and news articles with AI-generated summaries while keeping the schema simple and maintainable.

---

# Database Overview

Version 1 consists of two main entities:

- User
- Article

---

# User

The `User` table stores authentication and account information.

| Field         | Description                   |
| ------------- | ----------------------------- |
| id            | Unique user identifier (UUID) |
| name          | User's full name              |
| email         | Unique email address          |
| password_hash | Encrypted password            |
| created_at    | Account creation timestamp    |
| updated_at    | Last account update timestamp |

---

# Article

The `Article` table stores fetched news articles along with their AI-generated summaries.

| Field        | Description                                          |
| ------------ | ---------------------------------------------------- |
| id           | Unique article identifier (UUID)                     |
| title        | News headline                                        |
| description  | Short description provided by the news provider      |
| content      | Full article content (if available)                  |
| summary      | AI-generated summary                                 |
| author       | Author of the article                                |
| source_id    | News provider source identifier (e.g. cnn, bbc-news) |
| source_name  | Human-readable source name (e.g. CNN, BBC News)      |
| url          | Original article URL                                 |
| image_url    | Featured article image                               |
| published_at | Original publication date and time                   |
| provider     | News provider name (e.g. NewsAPI)                    |
| created_at   | Timestamp when the article was stored                |
| updated_at   | Last update timestamp                                |

---

# Relationships

There are no relationships between the User and Article tables in Version 1.

Every article is public and available to all authenticated users.

---

# Design Decisions

## Single Article Table

Version 1 stores the news source information (`source_id` and `source_name`) directly inside the `Article` table.

A separate `Source` table is intentionally omitted because the application only displays the source name and does not provide source management or filtering features.

This keeps the database design simple while meeting all Version 1 requirements.

---

## AI Summary Storage

AI-generated summaries are stored in the database after generation.

This avoids regenerating summaries for the same article, reducing response time and AI usage costs.

---

## Future Expansion

The database is designed to support future features without major restructuring.

Potential additions include:

- Bookmarks
- Search history
- User preferences
- Personalized news recommendations
- Reading history
- Source management
- AI conversation history

These features are outside the scope of Version 1 and will be introduced in future versions.
