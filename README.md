# Newsbit AI

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.139.0-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

> AI-powered news summarization platform that delivers the top 10 news stories with concise, intelligent summaries in minutes.

**Newsbit AI** helps busy professionals stay informed without spending hours reading lengthy articles. Through a simple AI-first interface, users receive today's most important news with AI-generated summaries, source attribution, and direct links to original articles.

---

## Features

- **🤖 AI-Powered Summaries**: Automatically generates concise 40-80 word summaries using Groq's Llama 3.3 model
- **📰 Top 10 News**: Curates the most important news stories from trusted sources
- **⚡ Real-time Fetching**: Scheduled background jobs fetch news daily at 6:00 AM IST
- **🎯 Simple Interface**: Clean, modern chat-based UI with prompt suggestions
- **🔗 Source Attribution**: Displays source names and direct links to original articles
- **🔄 Deduplication**: Automatically filters duplicate articles based on URLs
- **📅 Date Display**: Shows publication dates in user-friendly format
- **🌐 CORS Enabled**: Configured for seamless frontend-backend communication

---

## Architecture Overview

Newsbit AI follows a modern microservices-inspired architecture with clear separation of concerns:

```
┌─────────────┐
│   Next.js   │
│  Frontend   │
└──────┬──────┘
       │ HTTP
       ▼
┌─────────────┐
│  FastAPI    │
│  Backend    │
└──────┬──────┘
       │
   ┌───┴────────┐
   │            │
   ▼            ▼
┌─────────┐  ┌──────────┐
│PostgreSQL│ │  Groq AI │
│Database  │ │  Service │
└─────────┘  └──────────┘
               ▲
               │
         ┌─────┴─────┐
         │  NewsAPI  │
         │  External │
         └───────────┘
```

### Request Flow

1. **User submits prompt** → Frontend sends request to backend
2. **Backend fetches news** → Calls external NewsAPI for latest articles
3. **Deduplication** → Filters out articles already in database
4. **AI Summarization** → Sends new articles to Groq AI for summary generation
5. **Storage** → Saves articles with summaries to PostgreSQL
6. **Response** → Returns top 10 articles to frontend
7. **Display** → Frontend renders articles with summaries and source links

### Background Scheduler

- **APScheduler** runs daily at 6:00 AM IST (Asia/Kolkata timezone)
- Automatically fetches latest news and generates summaries
- Ensures fresh content is available when users start their day

---

## Tech Stack

### Backend

- **Framework**: FastAPI 0.139.0
- **Database**: PostgreSQL with SQLAlchemy 2.0.51 (async)
- **AI Service**: Groq API (Llama 3.3-70b-versatile)
- **News Source**: NewsAPI
- **Scheduler**: APScheduler 3.11.3
- **Async Runtime**: AsyncPG 0.31.0
- **Validation**: Pydantic 2.13.4
- **Server**: Uvicorn 0.51.0

### Frontend

- **Framework**: Next.js 16.2.10 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4
- **State Management**: React hooks
- **HTTP Client**: Axios 1.18.1
- **Icons**: Lucide React 1.25.0
- **Date Formatting**: date-fns 4.4.0

### Development Tools

- **Package Manager**: npm
- **Python Environment**: Virtual environment (.venv)
- **Linting**: ESLint 9

---

## Project Structure

```
newsbit/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       └── news.py          # News API endpoints
│   │   ├── core/
│   │   │   └── config.py            # Configuration & settings
│   │   ├── db/
│   │   │   └── database.py          # Database connection & session
│   │   ├── models/
│   │   │   ├── article.py           # Article model
│   │   │   └── user.py              # User model (for future auth)
│   │   ├── prompts/
│   │   │   └── news.py              # AI summary prompt
│   │   ├── services/
│   │   │   ├── llm_service.py       # LLM integration (placeholder)
│   │   │   └── news_service.py      # News fetching & processing
│   │   ├── scheduler.py             # Background job scheduler
│   │   ├── main.py                  # FastAPI application entry
│   │   ├── repositories/            # Data access layer (future)
│   │   ├── schemas/                 # Pydantic schemas (future)
│   │   ├── tests/                   # Test suite
│   │   ├── utils/                   # Utility functions (future)
│   │   └── workers/                 # Background workers (future)
│   ├── requirements.txt             # Python dependencies
│   ├── pyproject.toml               # Python project config
│   └── .env                         # Environment variables (gitignored)
├── frontend/
│   ├── app/
│   │   ├── components/
│   │   │   ├── ChatInput.tsx        # Message input component
│   │   │   ├── ChatMessage.tsx      # Message display (placeholder)
│   │   │   ├── Header.tsx           # App header
│   │   │   ├── MessageList.tsx      # Message list renderer
│   │   │   └── PromptChips.tsx      # Quick prompt suggestions
│   │   ├── pages/
│   │   │   └── Home.tsx             # Main home page
│   │   ├── services/
│   │   │   └── newsApi.ts           # API client
│   │   ├── store/
│   │   │   └── chatSlice.ts         # State management (placeholder)
│   │   ├── types/
│   │   │   ├── article.ts           # Article type definitions
│   │   │   └── message.ts           # Message type definitions
│   │   ├── layout.tsx               # Root layout
│   │   ├── page.tsx                 # Home page entry
│   │   └── globals.css              # Global styles
│   ├── public/                      # Static assets
│   ├── package.json                 # Node dependencies
│   ├── tsconfig.json                # TypeScript config
│   ├── next.config.ts               # Next.js config
│   ├── tailwind.config.ts           # TailwindCSS config
│   └── postcss.config.mjs           # PostCSS config
├── docs/
│   ├── 01-product.md                # Product vision
│   ├── 02-requirements.md          # Requirements
│   ├── 03-architecture.md           # Architecture details
│   ├── 04-database.md               # Database schema
│   ├── 05-api.md                    # API documentation
│   ├── 06-ai.md                     # AI integration
│   ├── 07-roadmap.md                # Future roadmap
│   ├── 08-decisions.md              # Design decisions
│   └── 09-deployment.md             # Deployment guide
└── README.md                        # This file
```

---

## Installation

### Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 20 or higher
- **PostgreSQL**: 15 or higher
- **npm**: Latest version

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # On macOS/Linux
# or
.venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Database Setup

```bash
# Create PostgreSQL database
createdb newsbit

# The application will automatically create tables on first run
# based on SQLAlchemy models
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` |
| `NEWS_API_URL` | NewsAPI endpoint | `https://newsapi.org/v2/top-headlines` |
| `NEWS_API_KEY` | NewsAPI API key | `your-newsapi-key` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@localhost:5432/newsbit` |
| `GROQ_API_KEY` | Groq API key for AI summaries | `your-groq-api-key` |

### Getting API Keys

- **NewsAPI**: Register at [newsapi.org](https://newsapi.org)
- **Groq API**: Get key at [console.groq.com](https://console.groq.com)

---

## Running Locally

### Start Backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at `http://localhost:8000`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Access the Application

1. Open browser to `http://localhost:3000`
2. Click on a prompt chip or type a message
3. View the top 10 news with AI summaries

---

## Database Setup

### Schema

The application uses two main tables:

#### Articles Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary key |
| `title` | String(255) | News headline |
| `description` | Text | Short description from provider |
| `content` | Text | Full article content |
| `summary` | Text | AI-generated summary |
| `author` | Text | Article author |
| `source_id` | String(100) | Source identifier |
| `source_name` | String(255) | Source name |
| `url` | String(500) | Original article URL (unique) |
| `image_url` | String(500) | Featured image URL |
| `published_at` | DateTime | Publication timestamp |
| `created_at` | DateTime | Database creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

#### Users Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | Integer | Primary key |
| `name` | String(100) | User's full name |
| `email` | String(100) | Unique email address |
| `password_hash` | String(255) | Encrypted password |
| `created_at` | DateTime | Account creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

### Migration

Tables are automatically created by SQLAlchemy on application startup. No manual migration is required for the current version.

---

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Root endpoint - API status |
| `GET` | `/health` | Health check endpoint |
| `GET` | `/news/v1/` | Get latest 10 news articles |
| `POST` | `/news/v1/fetch` | Manually trigger news fetch |

### Endpoint Details

#### Get Latest News

```http
GET /news/v1/
```

**Response:**
```json
[
  {
    "title": "Article Title",
    "summary": "AI-generated summary (40-80 words)",
    "url": "https://example.com/article"
  }
]
```

#### Fetch News

```http
POST /news/v1/fetch
```

**Response:**
```json
{
  "total_fetched": 20,
  "new_articles": 15,
  "duplicates": 5
}
```

---

## Background Jobs / Scheduler

The application uses **APScheduler** for background job execution:

### Scheduled Job

- **Job**: `run_news_fetch_job`
- **Trigger**: Cron expression
- **Schedule**: Daily at 6:00 AM IST (Asia/Kolkata)
- **Function**: Fetches latest news from NewsAPI, generates AI summaries, stores in database

### Manual Trigger

You can manually trigger the news fetch job via the API:

```bash
curl -X POST http://localhost:8000/news/v1/fetch
```

---

## Deployment Guide

### Production Deployment

Deployment configuration is documented in `docs/09-deployment.md`. The current setup is optimized for local development.

### Recommended Production Stack

- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Backend**: AWS ECS, Google Cloud Run, or Railway
- **Database**: AWS RDS, Google Cloud SQL, or Supabase
- **Process Manager**: Gunicorn or Uvicorn with systemd

### Environment Variables in Production

Ensure all environment variables are set in your production environment. Never commit `.env` files to version control.

---

## Configuration

### Backend Configuration

Configuration is managed through `app/core/config.py` using Pydantic Settings:

```python
class Settings(BaseSettings):
    FRONTEND_URL: str
    NEWS_API_URL: str
    NEWS_API_KEY: str
    DATABASE_URL: str
    GROQ_API_KEY: str
```

### Frontend Configuration

Frontend configuration is in `next.config.ts`. Currently minimal with no custom config.

### CORS Configuration

CORS is configured in `app/main.py` to allow requests from:
- `http://localhost:3000` (local development)
- `settings.FRONTEND_URL` (production)

---

## Development Workflow

### Backend Development

```bash
# Activate virtual environment
source .venv/bin/activate

# Run with auto-reload
uvicorn app.main:app --reload

# Run tests (when implemented)
pytest
```

### Frontend Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Code Style

- **Backend**: Follow PEP 8 guidelines
- **Frontend**: Follow ESLint rules and TypeScript best practices

---

## Scripts/Commands

### Backend

```bash
# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start production server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4

# Install dependencies
pip install -r requirements.txt
```

### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Install dependencies
npm install
```

---

## Error Handling

### Backend Error Handling

- **External API Failures**: Returns HTTP 502 if NewsAPI fails
- **AI Service Failures**: Returns HTTP 500 if Groq API fails
- **Database Errors**: Automatic rollback on commit failure
- **Validation Errors**: Handled by Pydantic validation

### Frontend Error Handling

- **API Errors**: Caught in try-catch blocks in `Home.tsx`
- **Network Errors**: Logged to console
- **Loading States**: UI shows "Thinking..." during API calls

### Logging

Backend uses Python's logging module:
- Logs errors to console
- Logs AI summary generation failures
- Logs database commit failures

---

## Security Notes

### Current Security Measures

- **Environment Variables**: Sensitive data stored in `.env` (gitignored)
- **CORS**: Configured to allow specific origins only
- **SQL Injection**: Protected by SQLAlchemy ORM
- **Input Validation**: Pydantic schemas validate all inputs

### Future Security Enhancements

- User authentication (JWT)
- Rate limiting
- API key encryption
- HTTPS enforcement
- Input sanitization
- CSRF protection

---

## Future Improvements

Based on the roadmap in `docs/07-roadmap.md`:

- **User Authentication**: Complete auth system with JWT
- **Personalization**: User-specific news recommendations
- **Natural Language**: Conversational AI interface
- **Categories**: News filtering by category
- **Bookmarks**: Save articles for later
- **Search**: Full-text search across articles
- **History**: Reading history tracking
- **Notifications**: Breaking news alerts
- **Mobile App**: React Native mobile application
- **Multi-language**: Support for multiple languages

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write clean, readable code
- Add comments for complex logic
- Follow existing code style
- Test your changes thoroughly
- Update documentation as needed

---

## License

This project is licensed under the MIT License.

---

## Documentation

Additional documentation is available in the `docs/` directory:

- **Product Vision**: `docs/01-product.md`
- **Requirements**: `docs/02-requirements.md`
- **Architecture**: `docs/03-architecture.md`
- **Database**: `docs/04-database.md`
- **API Design**: `docs/05-api.md`
- **AI Integration**: `docs/06-ai.md`
- **Roadmap**: `docs/07-roadmap.md`
- **Design Decisions**: `docs/08-decisions.md`
- **Deployment**: `docs/09-deployment.md`

---

## Support

For questions, issues, or suggestions, please open an issue on the GitHub repository.

---

**Built with ❤️ for busy professionals who want to stay informed without the noise.**