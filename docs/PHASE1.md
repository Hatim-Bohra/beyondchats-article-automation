# Phase 1: Web Scraping Implementation

## Overview

Phase 1 implements professional-grade web scraping for the BeyondChats blog with the following features:

- **Strategy Pattern** for extensible scraping
- **Robust pagination** handling
- **Comprehensive error handling**
- **Clean REST APIs** with Swagger documentation
- **Database integration** via Prisma ORM

---

## 1. Scraping Strategy

### Architecture

```typescript
interface ScraperStrategy {
  canHandle(url: string): boolean;
  scrape(url: string, options?: ScraperOptions): Promise<ScrapedArticle[]>;
}
```

### Implemented Strategies

#### 1. BeyondChatsStrategy
**Purpose**: Specialized scraper for BeyondChats blog

**Features**:
- Puppeteer-based for JavaScript-rendered content
- Automatic pagination detection
- Navigates to LAST page to get oldest articles
- Extracts: title, content, URL, author, publishedAt
- Robust selector fallbacks
- Comprehensive logging

**Pagination Logic**:
```typescript
1. Find last page number from pagination elements
2. Navigate to last page using multiple URL pattern attempts
3. Extract 5 oldest articles from that page
4. Verify page navigation success
```

**Selector Strategy** (with fallbacks):
```typescript
// Pagination
['.pagination a:last-child', '.pagination li:last-child a', ...]

// Articles
['article', '.post', '.blog-post', '.article-item', ...]

// Title
['h1', 'h2', 'h3', '.title', '[class*="title"]']

// Content
['.content', '.excerpt', 'p', '[class*="content"]']
```

#### 2. GenericArticleStrategy
**Purpose**: Fallback scraper for any article URL

**Features**:
- Cheerio-based for fast static HTML parsing
- Content extraction heuristics
- Removes ads, navigation, scripts
- Metadata extraction (og:title, article:published_time)

---

## 2. Database Schema

### Choice: PostgreSQL + Prisma ORM

**Why PostgreSQL?**
- ACID compliance for data integrity
- JSON support for flexible `references` field
- Excellent performance for read-heavy workloads
- Industry standard with strong ecosystem

**Why Prisma?**
- Type-safe database queries (compile-time error prevention)
- Automatic migration generation
- Generated TypeScript types
- Excellent developer experience

### Schema

```prisma
model Article {
  id             String        @id @default(uuid())
  title          String
  content        String        @db.Text
  sourceUrl      String        @map("source_url")
  status         ArticleStatus @default(ORIGINAL)
  
  // Enhanced version fields (Phase 2)
  updatedContent String?       @map("updated_content") @db.Text
  references     Json?
  
  // Metadata
  scrapedAt      DateTime      @default(now()) @map("scraped_at")
  updatedAt      DateTime      @updatedAt @map("updated_at")
  
  @@index([status])
  @@map("articles")
}

enum ArticleStatus {
  ORIGINAL    // Scraped, not yet enhanced
  PROCESSING  // Enhancement in progress
  ENHANCED    // Successfully enhanced
  FAILED      // Enhancement failed
}
```

### Design Decisions

1. **UUID Primary Key**: Prevents enumeration, better for distributed systems
2. **Status Enum**: Clear state machine for article lifecycle
3. **Text Type for Content**: Supports large articles (up to 1GB in PostgreSQL)
4. **Nullable updatedContent**: Original and enhanced in same record (easier comparison)
5. **JSON References**: Flexible for variable number of references
6. **Timestamps**: `scrapedAt` for ordering, `updatedAt` for tracking
7. **Index on Status**: Optimizes `WHERE status = 'ORIGINAL'` queries

---

## 3. API Endpoints

### Base URL
```
http://localhost:3001/api/v1
```

### Scraper Endpoints

#### 1. Scrape BeyondChats Blog

```http
POST /api/v1/scraper/scrape-beyondchats
```

**Response** (200 OK):
```json
{
  "message": "Successfully scraped and stored 5 articles",
  "count": 5,
  "articleIds": [
    "uuid-1",
    "uuid-2",
    "uuid-3",
    "uuid-4",
    "uuid-5"
  ]
}
```

**Error** (500 Internal Server Error):
```json
{
  "statusCode": 500,
  "message": "Failed to scrape BeyondChats blog: Navigation timeout",
  "error": "Internal Server Error"
}
```

#### 2. Scrape Any URL

```http
POST /api/v1/scraper/scrape-url
Content-Type: application/json

{
  "url": "https://example.com/article"
}
```

**Response** (200 OK):
```json
{
  "message": "Article scraped and stored successfully",
  "articleId": "uuid"
}
```

**Error** (400 Bad Request):
```json
{
  "statusCode": 400,
  "message": ["url must be a URL address"],
  "error": "Bad Request"
}
```

### Articles CRUD Endpoints

#### 1. List All Articles

```http
GET /api/v1/articles?skip=0&take=10&status=ORIGINAL
```

**Response**:
```json
[
  {
    "id": "uuid",
    "title": "Article Title",
    "content": "Article content...",
    "sourceUrl": "https://beyondchats.com/blogs/article",
    "status": "ORIGINAL",
    "updatedContent": null,
    "references": null,
    "scrapedAt": "2025-12-30T10:00:00Z",
    "updatedAt": "2025-12-30T10:00:00Z"
  }
]
```

#### 2. Get Single Article

```http
GET /api/v1/articles/{id}
```

**Response** (200 OK):
```json
{
  "id": "uuid",
  "title": "Article Title",
  "content": "Article content...",
  "sourceUrl": "https://beyondchats.com/blogs/article",
  "status": "ORIGINAL",
  "updatedContent": null,
  "references": null,
  "scrapedAt": "2025-12-30T10:00:00Z",
  "updatedAt": "2025-12-30T10:00:00Z"
}
```

**Error** (404 Not Found):
```json
{
  "statusCode": 404,
  "message": "Article with ID uuid not found",
  "error": "Not Found"
}
```

#### 3. Create Article

```http
POST /api/v1/articles
Content-Type: application/json

{
  "title": "New Article",
  "content": "Article content",
  "sourceUrl": "https://example.com/article",
  "status": "ORIGINAL"
}
```

#### 4. Update Article

```http
PATCH /api/v1/articles/{id}
Content-Type: application/json

{
  "title": "Updated Title"
}
```

#### 5. Delete Article

```http
DELETE /api/v1/articles/{id}
```

#### 6. Get Article Count

```http
GET /api/v1/articles/count?status=ORIGINAL
```

**Response**:
```json
5
```

---

## 4. Error Handling & Edge Cases

### Error Handling Strategy

#### 1. Validation Layer
- **DTO Validation**: `class-validator` decorators
- **Automatic**: NestJS ValidationPipe
- **Response**: 400 Bad Request with detailed errors

#### 2. Service Layer
- **Business Logic Errors**: Custom exceptions
- **Database Errors**: Prisma error handling
- **Response**: 404 Not Found, 409 Conflict, etc.

#### 3. Scraping Layer
- **Network Errors**: Timeout, connection refused
- **Parsing Errors**: Invalid HTML, missing elements
- **Strategy**: Retry logic, fallback selectors
- **Response**: 500 Internal Server Error with descriptive message

#### 4. Global Exception Filter
- **Catch-all**: Unhandled exceptions
- **Logging**: Full stack trace
- **Response**: 500 Internal Server Error

### Edge Cases Handled

#### 1. Pagination Not Found
```typescript
// Fallback: Assume single page
if (!paginationElement) {
  this.logger.warn('No pagination found, assuming single page');
  return 1;
}
```

#### 2. Article Elements Not Found
```typescript
// Try multiple selectors
for (const selector of articleSelectors) {
  articleElements = await page.$$(selector);
  if (articleElements && articleElements.length > 0) {
    break;
  }
}

if (!articleElements || articleElements.length === 0) {
  throw new Error('No articles found on page');
}
```

#### 3. Missing Article Fields
```typescript
// Only add if we have at least title and URL
if (article.title && article.sourceUrl) {
  articles.push(article);
}
```

#### 4. Relative URLs
```typescript
// Make URL absolute if relative
if (url && !url.startsWith('http')) {
  url = new URL(url, window.location.origin).href;
}
```

#### 5. Invalid Dates
```typescript
const parsedDate = new Date(dateStr);
if (!isNaN(parsedDate.getTime())) {
  publishedAt = parsedDate;
}
```

#### 6. Duplicate Articles
- **Database Constraint**: Unique index on `sourceUrl` (optional)
- **Application Logic**: Check before insert (optional)
- **Current**: Allow duplicates (scraping is idempotent)

#### 7. Large Content
- **PostgreSQL**: TEXT type supports up to 1GB
- **LLM Limits** (Phase 2): Truncate or chunk if needed

#### 8. Network Timeouts
```typescript
await page.setDefaultNavigationTimeout(timeout);
await page.goto(url, { waitUntil: 'networkidle2' });
```

#### 9. Bot Detection
```typescript
// Puppeteer stealth mode (future enhancement)
// User-Agent rotation
headers: {
  'User-Agent': 'Mozilla/5.0 ...'
}
```

---

## 5. Sample Implementation (Node.js + NestJS)

### Why NestJS?

**Justification**:
1. **Enterprise Architecture**: Built-in dependency injection, modular structure
2. **TypeScript First**: Full type safety across the stack
3. **Decorator-Based**: Clean, readable code (similar to Spring Boot)
4. **Excellent for APIs**: Built-in validation, Swagger, error handling
5. **Scalability**: Microservices-ready, horizontal scaling
6. **Testing**: First-class testing support with Jest
7. **Industry Standard**: Used by major companies (Adidas, Roche, etc.)

**vs Laravel (PHP)**:
- NestJS: Better for modern JavaScript ecosystem, microservices
- Laravel: Better for monolithic PHP applications
- **Choice**: NestJS for this assignment (full-stack JavaScript, better LLM integrations)

### Code Structure

```
src/scraper/
├── strategies/
│   ├── scraper.interface.ts       # Strategy contract
│   ├── beyondchats.strategy.ts    # BeyondChats implementation
│   └── generic-article.strategy.ts # Generic fallback
├── scraper.service.ts              # Orchestration logic
├── scraper.controller.ts           # REST endpoints
└── scraper.module.ts               # Module configuration
```

### Key Implementation Patterns

#### 1. Strategy Pattern
```typescript
interface ScraperStrategy {
  canHandle(url: string): boolean;
  scrape(url: string): Promise<ScrapedArticle[]>;
}

// Service selects strategy
private getStrategy(url: string): ScraperStrategy {
  for (const strategy of this.strategies) {
    if (strategy.canHandle(url)) {
      return strategy;
    }
  }
}
```

#### 2. Dependency Injection
```typescript
@Injectable()
export class ScraperService {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly configService: ConfigService,
    private readonly beyondChatsStrategy: BeyondChatsStrategy,
  ) {}
}
```

#### 3. Configuration Management
```typescript
const maxArticles = this.configService.get<number>('scraping.maxArticles', 5);
const timeout = this.configService.get<number>('scraping.timeout', 30000);
```

#### 4. Comprehensive Logging
```typescript
this.logger.log(`Starting scrape of ${url}`);
this.logger.warn('No pagination found');
this.logger.error(`Scraping failed: ${error.message}`, error.stack);
```

---

## 6. Testing Strategy

### Unit Tests

```typescript
describe('BeyondChatsStrategy', () => {
  it('should handle BeyondChats URLs', () => {
    expect(strategy.canHandle('https://beyondchats.com/blogs')).toBe(true);
  });

  it('should extract articles with all fields', async () => {
    const articles = await strategy.scrape(mockUrl);
    expect(articles[0]).toHaveProperty('title');
    expect(articles[0]).toHaveProperty('content');
    expect(articles[0]).toHaveProperty('sourceUrl');
  });
});
```

### Integration Tests

```typescript
describe('ScraperController (e2e)', () => {
  it('/POST scraper/scrape-beyondchats', () => {
    return request(app.getHttpServer())
      .post('/api/v1/scraper/scrape-beyondchats')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('count');
        expect(res.body).toHaveProperty('articleIds');
      });
  });
});
```

---

## 7. Usage Examples

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up database
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:16-alpine

# 3. Configure environment
cd apps/backend
cp .env.example .env
# Edit .env with DATABASE_URL

# 4. Run migrations
npm run db:generate
npm run db:migrate

# 5. Start server
npm run dev
```

### Trigger Scraping

```bash
# Via curl
curl -X POST http://localhost:3001/api/v1/scraper/scrape-beyondchats

# Via Swagger UI
# Navigate to http://localhost:3001/api
# Find "scraper" section
# Click "Try it out" on POST /scraper/scrape-beyondchats
```

### Verify Results

```bash
# List articles
curl http://localhost:3001/api/v1/articles

# Open Prisma Studio
npm run db:studio
# Navigate to http://localhost:5555
```

---

## 8. Production Considerations

### Performance
- **Puppeteer**: Headless mode for faster scraping
- **Connection Pooling**: Prisma handles automatically
- **Indexing**: Status column indexed for fast queries

### Reliability
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Detailed logs for debugging
- **Timeouts**: Configurable navigation timeouts

### Scalability
- **Stateless**: Can run multiple instances
- **Job Queue** (Phase 2): For async processing
- **Database**: PostgreSQL scales well

### Security
- **Validation**: All inputs validated
- **SQL Injection**: Prevented by Prisma (parameterized queries)
- **Rate Limiting**: Can add with `@nestjs/throttler`

### Monitoring
- **Health Checks**: `/health` endpoint
- **Logging**: Winston for production
- **Metrics**: Can add Prometheus/Grafana

---

## Summary

Phase 1 delivers:

✅ **Production-grade scraping** with strategy pattern  
✅ **Robust pagination** handling with fallbacks  
✅ **Clean REST APIs** with Swagger documentation  
✅ **Type-safe database** access with Prisma  
✅ **Comprehensive error handling** at all layers  
✅ **Extensible architecture** (easy to add new sources)  
✅ **Interview-ready code** with clear patterns  

**Next**: Phase 2 - Automation & LLM Enhancement
