# BeyondChats Article Automation

> **Production-grade article automation system with web scraping, LLM enhancement, and React frontend**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-red)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-green)](https://www.prisma.io/)

## 📋 Overview

This system automates the process of scraping articles from BeyondChats blog, enhancing them using LLM (GPT-4/Claude), and displaying original vs enhanced versions in a professional React UI.

### Features

- 🔍 **Web Scraping**: Automated scraping of BeyondChats blog articles using Puppeteer
- 🤖 **LLM Enhancement**: Article improvement using OpenAI GPT-4 or Anthropic Claude
- 📊 **CRUD APIs**: Full REST API with Swagger documentation
- ⚡ **Job Queue**: Async processing with BullMQ and Redis
- 🎨 **Modern UI**: React 18 + Vite + Tailwind CSS + TanStack Query
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- 📝 **Type Safety**: Full TypeScript coverage across frontend and backend
- 🐳 **Docker Ready**: Containerized deployment configuration

## 🏗️ Architecture

```
┌─────────────────┐
│  React Frontend │ ← User Interface (Vite + Tailwind)
└────────┬────────┘
         │ HTTP/REST
┌────────▼────────┐
│   NestJS API    │ ← CRUD Operations + Swagger Docs
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
┌───▼───┐ ┌──▼──┐  ┌────▼────┐ ┌──▼──┐
│Prisma │ │Redis│  │Puppeteer│ │ LLM │
│  ORM  │ │Queue│  │ Scraper │ │ API │
└───┬───┘ └─────┘  └─────────┘ └─────┘
    │
┌───▼────────┐
│ PostgreSQL │
└────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **PostgreSQL** >= 14
- **Redis** >= 7 (for job queue)
- **npm** >= 10.0.0

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd beyondchats-article-automation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   
   **Option 1: Docker (Recommended)**
   ```bash
   docker run --name beyondchats-db \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=beyondchats \
     -p 5432:5432 \
     -d postgres:16-alpine
   ```
   
   **Option 2: Local PostgreSQL**
   ```bash
   createdb beyondchats
   ```

4. **Set up Redis**
   ```bash
   docker run --name beyondchats-redis \
     -p 6379:6379 \
     -d redis:7-alpine
   ```

5. **Configure environment variables**
   
   **Backend:**
   ```bash
   cd apps/backend
   cp .env.example .env
   ```
   
   Edit `apps/backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/beyondchats"
   REDIS_URL="redis://localhost:6379"
   OPENAI_API_KEY="your_openai_api_key"
   SERPAPI_KEY="your_serpapi_key"
   ```
   
   **Frontend:**
   ```bash
   cd apps/frontend
   cp .env.example .env
   ```

6. **Generate Prisma Client and run migrations**
   ```bash
   cd apps/backend
   npm run db:generate
   npm run db:migrate
   ```

7. **Start development servers**
   
   **Terminal 1 - Backend:**
   ```bash
   npm run dev:backend
   ```
   
   **Terminal 2 - Frontend:**
   ```bash
   npm run dev:frontend
   ```

8. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Swagger Docs: http://localhost:3001/api

## 📚 API Documentation

### Articles Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/articles` | List all articles (with pagination) |
| `GET` | `/api/v1/articles/:id` | Get single article |
| `GET` | `/api/v1/articles/count` | Get article count by status |
| `POST` | `/api/v1/articles` | Create new article |
| `PATCH` | `/api/v1/articles/:id` | Update article |
| `DELETE` | `/api/v1/articles/:id` | Delete article |

### Scraper Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/scraper/scrape` | Trigger BeyondChats blog scraping |

### Automation Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/automation/enhance-all` | Enhance all original articles |
| `POST` | `/api/v1/automation/enhance/:id` | Enhance specific article |

**Interactive Documentation:** Visit http://localhost:3001/api for full Swagger UI

## 🗂️ Project Structure

```
beyondchats-article-automation/
├── apps/
│   ├── backend/                    # NestJS API
│   │   ├── src/
│   │   │   ├── articles/          # CRUD module
│   │   │   ├── scraper/           # Web scraping
│   │   │   ├── automation/        # LLM enhancement
│   │   │   ├── prisma/            # Database service
│   │   │   ├── config/            # Configuration
│   │   │   ├── main.ts
│   │   │   └── app.module.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma      # Database schema
│   │   ├── .env.example
│   │   └── package.json
│   │
│   └── frontend/                   # React app
│       ├── src/
│       │   ├── pages/             # Route pages
│       │   ├── components/        # React components
│       │   ├── hooks/             # Custom hooks
│       │   ├── api/               # API client
│       │   └── main.tsx
│       ├── .env.example
│       └── package.json
│
├── package.json                    # Root workspace
├── .prettierrc
├── .eslintrc.js
└── README.md
```

## 🛠️ Tech Stack

### Backend
- **Framework:** NestJS 11 with TypeScript
- **Database:** PostgreSQL 16 + Prisma ORM
- **Job Queue:** BullMQ + Redis
- **Web Scraping:** Puppeteer + Cheerio
- **LLM Integration:** OpenAI GPT-4 / Anthropic Claude
- **Search:** SerpAPI (Google Search)
- **Validation:** class-validator + class-transformer
- **Documentation:** Swagger/OpenAPI

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** TanStack Query (React Query)
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Icons:** Lucide React

## 📖 Usage Guide

### Phase 1: Scraping Articles

1. **Trigger scraping via API:**
   ```bash
   curl -X POST http://localhost:3001/api/v1/scraper/scrape
   ```

2. **Verify articles in database:**
   ```bash
   cd apps/backend
   npm run db:studio
   ```

3. **Check via API:**
   ```bash
   curl http://localhost:3001/api/v1/articles
   ```

### Phase 2: Enhancing Articles

1. **Enhance all original articles:**
   ```bash
   curl -X POST http://localhost:3001/api/v1/automation/enhance-all
   ```

2. **Enhance specific article:**
   ```bash
   curl -X POST http://localhost:3001/api/v1/automation/enhance/{article-id}
   ```

3. **Monitor job progress in logs**

### Phase 3: Viewing Results

1. Open frontend: http://localhost:5173
2. Browse article list
3. Click on enhanced articles to see comparison view
4. View references used for enhancement

## 🧪 Testing

### Backend Tests
```bash
cd apps/backend

# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Frontend Tests
```bash
cd apps/frontend

# Component tests
npm test
```

## 🐳 Docker Deployment

### Build and run with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis
- Backend API (port 3001)
- Frontend (port 80)

### Individual containers

**Backend:**
```bash
docker build -f docker/backend.Dockerfile -t beyondchats-backend .
docker run -p 3001:3001 beyondchats-backend
```

**Frontend:**
```bash
docker build -f docker/frontend.Dockerfile -t beyondchats-frontend .
docker run -p 80:80 beyondchats-frontend
```

## 🚢 Production Deployment

### Backend (Railway/Render)

1. Connect your GitHub repository
2. Set environment variables:
   - `DATABASE_URL`
   - `REDIS_URL`
   - `OPENAI_API_KEY`
   - `SERPAPI_KEY`
3. Deploy from `apps/backend`

### Frontend (Vercel)

1. Connect your GitHub repository
2. Set build settings:
   - **Framework:** Vite
   - **Root Directory:** `apps/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Set environment variable:
   - `VITE_API_URL=https://your-backend-url.com`
4. Deploy

## 📊 Database Schema

```prisma
model Article {
  id             String        @id @default(uuid())
  title          String
  content        String        @db.Text
  sourceUrl      String
  status         ArticleStatus @default(ORIGINAL)
  updatedContent String?       @db.Text
  references     Json?
  scrapedAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

enum ArticleStatus {
  ORIGINAL
  PROCESSING
  ENHANCED
  FAILED
}
```

## 🔧 Configuration

### Environment Variables

**Backend (`apps/backend/.env`):**

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `REDIS_URL` | Redis connection string | ✅ |
| `PORT` | Server port (default: 3001) | ❌ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `SERPAPI_KEY` | SerpAPI key for Google search | ✅ |
| `LLM_PROVIDER` | `openai` or `anthropic` | ❌ |
| `PUPPETEER_HEADLESS` | Run browser headless | ❌ |
| `CORS_ORIGIN` | Allowed frontend origin | ❌ |

**Frontend (`apps/frontend/.env`):**

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | ✅ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Scripts Reference

### Root (Monorepo)
```bash
npm run dev:backend        # Start backend dev server
npm run dev:frontend       # Start frontend dev server
npm run build              # Build all packages
npm run test               # Run all tests
npm run lint               # Lint all packages
npm run format             # Format code with Prettier
```

### Backend
```bash
npm run dev                # Development mode with watch
npm run build              # Build for production
npm run start:prod         # Run production build
npm run db:migrate         # Run database migrations
npm run db:studio          # Open Prisma Studio
npm run db:generate        # Generate Prisma Client
npm test                   # Run unit tests
npm run test:e2e           # Run E2E tests
```

### Frontend
```bash
npm run dev                # Development server
npm run build              # Production build
npm run preview            # Preview production build
npm run lint               # Lint code
```

## 🐛 Troubleshooting

### Database connection issues
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Test connection
psql -h localhost -U user -d beyondchats
```

### Redis connection issues
```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
```

### Prisma Client errors
```bash
cd apps/backend
npm run db:generate
```

### Port already in use
```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

## 📄 License

MIT

## 👤 Author

Built for BeyondChats hiring assignment

---

**⭐ If you found this helpful, please star the repository!**
