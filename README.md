# BeyondChats Article Automation System

> **Production-grade full-stack application** for automated article scraping, AI enhancement, and content management.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Live Demo**: [Frontend](http://localhost:5173) | [API Docs](http://localhost:3001/api)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [How It Works](#how-it-works)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Tech Stack](#tech-stack)

---

## 🎯 Overview

This system automates the entire article enhancement workflow:

1. **Scrapes** articles from BeyondChats blog
2. **Searches** Google for relevant external references
3. **Enhances** content using AI (OpenAI GPT-4 / Anthropic Claude)
4. **Displays** original vs enhanced versions in a responsive UI

**Key Features:**
- ✅ Automated web scraping with multiple strategies
- ✅ AI-powered content enhancement with SEO optimization
- ✅ Asynchronous job processing with retry logic
- ✅ Side-by-side article comparison UI
- ✅ Full REST API with Swagger documentation
- ✅ Production-ready error handling and logging

---

## 🏗️ Architecture

### System Design

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │─────▶│   NestJS     │─────▶│ PostgreSQL  │
│  Frontend   │      │   Backend    │      │  Database   │
│  (Port 5173)│      │  (Port 3001) │      │             │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ├─────▶ Redis (Job Queue)
                            ├─────▶ OpenAI API (LLM)
                            ├─────▶ SerpAPI (Search)
                            └─────▶ Puppeteer (Scraping)
```

### Data Flow

```
1. User triggers scraping
   └─▶ BeyondChats blog scraped (Puppeteer)
       └─▶ Articles saved to PostgreSQL

2. User triggers enhancement
   └─▶ Job added to BullMQ queue
       └─▶ Google Search for references (SerpAPI)
           └─▶ Reference content extracted (Cheerio)
               └─▶ LLM enhancement (OpenAI/Anthropic)
                   └─▶ Enhanced article saved to DB

3. User views in frontend
   └─▶ React Query fetches from API
       └─▶ Side-by-side comparison displayed
```

### Monorepo Structure

```
beyondchats-article-automation/
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   ├── articles/      # CRUD operations
│   │   │   ├── scraper/       # Web scraping (Strategy pattern)
│   │   │   ├── automation/    # LLM enhancement pipeline
│   │   │   │   ├── google-search/
│   │   │   │   ├── content-scraper/
│   │   │   │   ├── llm/       # Provider pattern (OpenAI/Anthropic)
│   │   │   │   └── jobs/      # BullMQ processors
│   │   │   └── prisma/        # Database service
│   │   └── prisma/
│   │       └── schema.prisma  # Database schema
│   └── frontend/         # React SPA
│       ├── src/
│       │   ├── components/    # Reusable UI
│       │   ├── pages/         # Route pages
│       │   └── lib/           # API client & hooks
│       └── tailwind.config.js
└── docs/                 # Documentation
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker (optional, recommended)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/beyondchats-article-automation.git
cd beyondchats-article-automation

# 2. Install dependencies
npm install

# 3. Start PostgreSQL & Redis (Docker)
docker run --name beyondchats-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=beyondchats -p 5432:5432 -d postgres:16-alpine
docker run --name beyondchats-redis -p 6379:6379 -d redis:7-alpine

# 4. Configure environment
cd apps/backend
cp .env.example .env
# Edit .env with your API keys

# 5. Setup database
npm run db:generate
npm run db:migrate

# 6. Start development servers
cd ../..
npm run dev:backend  # http://localhost:3001
npm run dev:frontend # http://localhost:5173
```

### Verify Installation

```bash
# Check backend health
curl http://localhost:3001

# Check API docs
open http://localhost:3001/api

# Check frontend
open http://localhost:5173
```

---

## 🔧 How It Works

### Phase 1: Web Scraping

**Endpoint**: `POST /api/v1/scraper/scrape-beyondchats`

```typescript
// Strategy Pattern for extensible scraping
interface ScraperStrategy {
  scrape(): Promise<Article[]>;
}

// BeyondChatsStrategy uses Puppeteer for dynamic content
// GenericArticleStrategy uses Cheerio for static pages
```

**Process:**
1. Puppeteer launches headless browser
2. Navigates to BeyondChats blog
3. Detects pagination (last page number)
4. Extracts: title, content, author, date, URL
5. Saves to PostgreSQL with `status: ORIGINAL`

### Phase 2: AI Enhancement

**Endpoint**: `POST /api/v1/automation/enhance-all`

```typescript
// Job Queue with BullMQ for async processing
const job = await queue.add('enhance', { articleId }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 }
});
```

**7-Step Enhancement Pipeline:**

1. **Fetch Original** - Get article from database
2. **Google Search** - Find top 2 relevant articles (SerpAPI)
3. **Scrape References** - Extract content from search results
4. **Prepare Context** - Combine original + references (max 3000 chars)
5. **LLM Enhancement** - Send to OpenAI/Anthropic with SEO prompt
6. **Parse Response** - Extract enhanced content + references
7. **Save Enhanced** - Update database with `status: ENHANCED`

**LLM Prompt Strategy:**

```
You are an expert SEO content editor. Enhance this article:

GUIDELINES:
1. Preserve original meaning and key points
2. Improve readability and structure
3. Add depth using provided references
4. Optimize for SEO (keywords, headings)
5. Maintain professional tone

ORIGINAL ARTICLE:
{content}

REFERENCE MATERIALS:
{references}

OUTPUT: Enhanced article in markdown
```

### Phase 3: Frontend Display

**Tech**: React 18 + TanStack Query + Tailwind CSS

**Key Components:**

- `ArticleListPage` - Grid view with status filtering
- `ArticleComparison` - Side-by-side original vs enhanced
- `ArticleCard` - Preview with status badge
- React Query hooks for automatic caching & refetching

**State Management:**

```typescript
// TanStack Query for server state
const { data: articles } = useArticles();

// Automatic background refetching
// Optimistic updates
// Loading & error states handled
```

---

## 🔐 Environment Variables

### Backend (`apps/backend/.env`)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/beyondchats"

# Redis
REDIS_URL="redis://localhost:6379"

# LLM Provider (openai or anthropic)
LLM_PROVIDER="openai"

# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4-turbo-preview"

# Anthropic (optional)
ANTHROPIC_API_KEY="sk-ant-..."

# Google Search
SERPAPI_KEY="..."

# Server
PORT=3001
NODE_ENV="development"
```

### Frontend (`apps/frontend/.env`)

```env
VITE_API_URL="http://localhost:3001/api/v1"
```

---

## 📚 API Documentation

### Interactive Swagger Docs

Visit: **http://localhost:3001/api**

### Key Endpoints

#### Articles

```bash
# Get all articles
GET /api/v1/articles?status=ENHANCED

# Get single article
GET /api/v1/articles/:id

# Create article
POST /api/v1/articles

# Update article
PATCH /api/v1/articles/:id

# Delete article
DELETE /api/v1/articles/:id
```

#### Scraper

```bash
# Scrape BeyondChats blog
POST /api/v1/scraper/scrape-beyondchats

# Scrape single URL
POST /api/v1/scraper/scrape-url
Body: { "url": "https://example.com/article" }
```

#### Automation

```bash
# Enhance all ORIGINAL articles
POST /api/v1/automation/enhance-all

# Enhance specific article
POST /api/v1/automation/enhance/:id

# Check job status
GET /api/v1/automation/jobs/:jobId
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| **NestJS** | Enterprise-grade Node.js framework |
| **Prisma** | Type-safe ORM for PostgreSQL |
| **BullMQ** | Redis-based job queue |
| **Puppeteer** | Headless browser for dynamic scraping |
| **Cheerio** | Fast HTML parsing for static content |
| **SerpAPI** | Google Search API integration |
| **OpenAI** | GPT-4 for content enhancement |
| **Anthropic** | Claude as alternative LLM |

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI library with hooks |
| **Vite** | Fast build tool & dev server |
| **TanStack Query** | Server state management |
| **React Router** | Client-side routing |
| **Tailwind CSS** | Utility-first styling |
| **Axios** | HTTP client with interceptors |
| **react-markdown** | Markdown rendering |

### Database & Infrastructure

| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary database |
| **Redis** | Job queue & caching |
| **Docker** | Containerization |
| **TypeScript** | Type safety across stack |

---

## 📸 Screenshots

### Article List View
![Article List](./docs/screenshots/article-list.png)
*Grid view with status filtering and responsive design*

### Article Comparison
![Comparison View](./docs/screenshots/comparison.png)
*Side-by-side original vs enhanced content with references*

### Swagger API Documentation
![API Docs](./docs/screenshots/swagger.png)
*Interactive API documentation with try-it-out functionality*

---

## 🎯 Design Decisions

### Why Strategy Pattern for Scraping?

Different websites require different scraping approaches. The Strategy pattern allows:
- Easy addition of new scrapers without modifying existing code
- BeyondChats uses Puppeteer (dynamic content)
- Generic scraper uses Cheerio (faster for static sites)

### Why TanStack Query over Redux?

For server state management:
- ✅ Automatic caching & background refetching
- ✅ Built-in loading & error states
- ✅ Optimistic updates out of the box
- ✅ Less boilerplate than Redux

### Why BullMQ for Job Processing?

LLM enhancement can take 10-30 seconds per article:
- ✅ Non-blocking API responses
- ✅ Retry logic with exponential backoff
- ✅ Progress tracking
- ✅ Horizontal scaling capability

### Why Monorepo?

- ✅ Shared TypeScript types between frontend/backend
- ✅ Single `npm install` for all dependencies
- ✅ Consistent tooling (ESLint, Prettier)
- ✅ Easier code sharing and refactoring

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Backend unit tests
npm run test:backend

# Frontend component tests
npm run test:frontend

# E2E tests
npm run test:e2e
```

---

## 🚀 Deployment

### Backend (Railway / Render)

```bash
# Build
npm run build:backend

# Start production
npm run start:backend
```

### Frontend (Vercel)

```bash
# Build
npm run build:frontend

# Preview
npm run preview:frontend
```

### Environment Variables

Set these in your deployment platform:
- `DATABASE_URL` (from Railway PostgreSQL)
- `REDIS_URL` (from Upstash or Railway)
- `OPENAI_API_KEY`
- `SERPAPI_KEY`
- `VITE_API_URL` (frontend only)

---

## 📖 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Phase 1: Web Scraping](./docs/PHASE1.md)
- [Phase 2: LLM Enhancement](./docs/PHASE2.md)
- [Phase 3: React Frontend](./docs/PHASE3.md)
- [Production Checklist](./docs/PRODUCTION_CHECKLIST.md)

---

## 🤝 Contributing

This is a hiring assignment project. For production use:

1. Add comprehensive test coverage
2. Implement rate limiting
3. Add authentication & authorization
4. Set up monitoring (Sentry, LogRocket)
5. Add CI/CD pipeline
6. Implement WebSocket for real-time job updates

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- BeyondChats for the assignment
- OpenAI for GPT-4 API
- NestJS & React communities

---

**Built with ❤️ for BeyondChats Hiring Assignment**
