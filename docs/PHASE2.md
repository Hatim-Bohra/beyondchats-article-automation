# Phase 2: Automation & LLM Enhancement Implementation

## Overview

Phase 2 implements end-to-end article enhancement automation with:

- **Google Search Integration** via SerpAPI
- **Intelligent Content Extraction** from top-ranking articles
- **LLM Enhancement** using OpenAI GPT-4 or Anthropic Claude
- **Async Job Processing** with BullMQ and Redis
- **Production-Ready Error Handling** and retry logic

---

## 1. Tooling Choices

### Google Search API: SerpAPI

**Choice**: SerpAPI (https://serpapi.com/)

**Why SerpAPI over SERP Scraping?**

| Aspect | SerpAPI | Direct SERP Scraping |
|--------|---------|---------------------|
| **Reliability** | ✅ 99.9% uptime | ❌ Breaks with Google changes |
| **Rate Limiting** | ✅ Built-in | ❌ Manual implementation needed |
| **Proxy Management** | ✅ Handled by service | ❌ Complex proxy rotation |
| **CAPTCHA Handling** | ✅ Automatic | ❌ Manual solving required |
| **Legal** | ✅ Terms-compliant | ⚠️ Gray area |
| **Structured Data** | ✅ Clean JSON | ❌ HTML parsing fragile |
| **Cost** | 💰 $50/month (5000 searches) | 🆓 Free but unreliable |

**Production Justification**:
- Scraping Google directly is fragile (selectors change frequently)
- CAPTCHA and bot detection make it unreliable
- SerpAPI provides structured, reliable results
- Free tier: 100 searches/month (good for testing)

**Alternative**: Google Custom Search API
- Cheaper but limited to 100 queries/day free
- SerpAPI better for production scale

---

## 2. Content Extraction Strategy

### Multi-Strategy Approach

```typescript
// Strategy 1: Common article containers
const contentSelectors = [
  'article',
  '[role="main"]',
  'main',
  '.article-content',
  '.post-content',
  '.entry-content',
];

// Strategy 2: Largest text block heuristic
// Find div/section with most text content

// Strategy 3: Fallback to all paragraphs
const paragraphs = $('p').map(...).join('\n\n');
```

### Content Cleaning Pipeline

1. **Remove Unwanted Elements**:
   ```typescript
   clone.find('script, style, nav, header, footer, aside, iframe, .ad, .advertisement, .social-share, .comments').remove();
   ```

2. **Normalize Whitespace**:
   ```typescript
   text.split('\n')
     .map(line => line.trim())
     .filter(line => line.length > 0)
     .join('\n\n');
   ```

3. **Remove Excessive Newlines**:
   ```typescript
   text.replace(/\n{3,}/g, '\n\n');
   ```

### Quality Checks

- Minimum content length: 200 characters
- Ensure substantial content (not just navigation/ads)
- Multiple fallback strategies for robustness

---

## 3. LLM Prompt (CRITICAL COMPONENT)

### Prompt Structure

```
[System Context]
↓
[Original Article]
↓
[Reference Article 1]
↓
[Reference Article 2]
↓
[Detailed Instructions]
↓
[Output Requirements]
```

### Full Prompt Template

```typescript
You are an expert content editor and SEO specialist. Your task is to enhance an article to match the quality and depth of top-ranking articles on Google.

## ORIGINAL ARTICLE TO ENHANCE

**Title:** ${originalTitle}

**Content:**
${originalContent}

---

## TOP-RANKING REFERENCE ARTICLES

### Reference Article 1: "${reference1Title}"
${reference1Content}

### Reference Article 2: "${reference2Title}"
${reference2Content}

---

## YOUR TASK

Analyze the reference articles and enhance the original article following these guidelines:

### 1. STRUCTURE & FORMATTING
- Use clear headings and subheadings (H2, H3) like the reference articles
- Break content into digestible sections
- Use bullet points and numbered lists where appropriate
- Add paragraph breaks for readability

### 2. CONTENT DEPTH
- Match the level of detail found in reference articles
- Add explanations, examples, or context where reference articles go deeper
- Include relevant statistics, facts, or insights if references do
- Expand on key points that are briefly mentioned

### 3. TONE & STYLE
- Maintain a professional, informative tone
- Write in a clear, engaging manner
- Use active voice where possible
- Keep sentences concise and readable

### 4. PRESERVE ORIGINAL INTENT
- **CRITICAL:** Do NOT change the core message or meaning
- Keep the original perspective and key arguments
- Maintain any unique insights from the original
- Do NOT plagiarize from reference articles

### 5. SEO OPTIMIZATION
- Use natural keyword variations
- Include relevant terms found in top-ranking articles
- Ensure content is comprehensive and authoritative

## OUTPUT REQUIREMENTS

Return ONLY the enhanced article content in markdown format.
- Start with the title as H1 (# Title)
- Use proper markdown formatting (##, ###, -, *, etc.)
- Do NOT include meta-commentary or explanations
- Do NOT add a references section (that will be added separately)
```

### Prompt Design Rationale

1. **Clear Role Definition**: "Expert content editor and SEO specialist"
2. **Structured Input**: Original + 2 references clearly separated
3. **Explicit Guidelines**: 5 categories with specific instructions
4. **Preservation Emphasis**: "CRITICAL: Do NOT change core message"
5. **Output Format**: Markdown for clean formatting
6. **No Hallucination**: "Do NOT include meta-commentary"

### Token Management

- Truncate reference articles to 3000 chars each (prevents token limit issues)
- Total prompt: ~7000-8000 tokens
- Response: ~4000 tokens
- Total: ~12000 tokens (well within GPT-4 limit of 128k)

---

## 4. Script Architecture

### End-to-End Workflow

```
┌─────────────────────────────────────────────────────────┐
│ 1. POST /api/v1/automation/enhance-all                 │
│    Trigger enhancement for all ORIGINAL articles        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. AutomationService.enhanceAllOriginalArticles()      │
│    - Fetch articles with status=ORIGINAL               │
│    - Queue job for each article                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. BullMQ Job Queue (Redis)                            │
│    - Job: { articleId }                                │
│    - Retry: 3 attempts with exponential backoff        │
│    - Concurrency: 2 jobs in parallel                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. EnhanceArticleProcessor.process(job)                │
│    Step-by-step enhancement workflow                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─► Step 1: Fetch article from database
                 │   Progress: 10%
                 │
                 ├─► Step 2: Update status to PROCESSING
                 │   Progress: 20%
                 │
                 ├─► Step 3: Search Google for article title
                 │   GoogleSearchService.search(title, 'beyondchats.com', 2)
                 │   Progress: 40%
                 │
                 ├─► Step 4: Scrape top 2 results
                 │   ContentScraperService.scrapeArticle(url)
                 │   Progress: 60%
                 │
                 ├─► Step 5: Call LLM for enhancement
                 │   LLMService.enhanceArticle({original, ref1, ref2})
                 │   Progress: 80%
                 │
                 ├─► Step 6: Add references section
                 │   LLMService.addReferences(content, refs)
                 │   Progress: 90%
                 │
                 └─► Step 7: Update article in database
                     ArticlesService.update(id, {updatedContent, references, status: 'ENHANCED'})
                     Progress: 100%
```

### Module Breakdown

#### 1. GoogleSearchService
**File**: `automation/google-search/google-search.service.ts`

**Responsibilities**:
- Call SerpAPI with article title
- Filter out non-article URLs (PDFs, forums, videos, social media)
- Exclude specified domain (beyondchats.com)
- Return top 2 blog/article results

**Key Methods**:
```typescript
search(query: string, excludeDomain?: string, maxResults: number = 2): Promise<SearchResult[]>
isNonArticleUrl(url: string): boolean
```

#### 2. ContentScraperService
**File**: `automation/content-scraper/content-scraper.service.ts`

**Responsibilities**:
- Scrape main content from article URLs
- Use multiple extraction strategies
- Clean content (remove ads, nav, scripts)
- Extract title and metadata

**Key Methods**:
```typescript
scrapeArticle(url: string): Promise<ScrapedContent>
extractMainContent($: CheerioAPI): string
cleanContent($: CheerioAPI, element: Cheerio): string
```

#### 3. LLMService
**File**: `automation/llm/llm.service.ts`

**Responsibilities**:
- Select LLM provider (OpenAI or Anthropic)
- Build enhancement prompt
- Call LLM API
- Add references section

**Key Methods**:
```typescript
enhanceArticle(params: EnhanceArticleParams): Promise<string>
addReferences(content: string, refs: Reference[]): string
```

#### 4. EnhanceArticleProcessor
**File**: `automation/jobs/enhance-article.processor.ts`

**Responsibilities**:
- Process enhancement jobs from queue
- Orchestrate entire workflow
- Update progress at each step
- Handle errors and update status

**Key Methods**:
```typescript
process(job: Job<EnhanceArticleJobData>): Promise<EnhanceArticleJobResult>
```

#### 5. AutomationService
**File**: `automation/automation.service.ts`

**Responsibilities**:
- Queue enhancement jobs
- Manage job lifecycle
- Provide job status API

**Key Methods**:
```typescript
enhanceAllOriginalArticles(): Promise<{message, queued, jobIds}>
enhanceArticle(articleId: string): Promise<{message, jobId}>
getJobStatus(jobId: string): Promise<JobStatus>
```

---

## 5. Edge Cases & Safeguards

### 1. Insufficient Search Results

**Problem**: Google returns < 2 results

**Solution**:
```typescript
while (scrapedContents.length < 2) {
  scrapedContents.push({
    title: 'Reference Article',
    content: 'No additional reference available.',
    url: '',
  });
}
```

### 2. Scraping Failures

**Problem**: Article URL returns 404 or timeout

**Safeguard**:
- Try-catch around each scrape
- Continue with available references
- Log error but don't fail entire job

### 3. LLM API Failures

**Problem**: OpenAI/Anthropic API down or rate limited

**Safeguard**:
- Retry logic: 3 attempts with exponential backoff
- Update article status to FAILED
- Preserve error message for debugging

### 4. Token Limit Exceeded

**Problem**: Article + references too long for LLM

**Safeguard**:
```typescript
reference1Content.substring(0, 3000)  // Truncate to 3000 chars
```

### 5. Invalid LLM Response

**Problem**: LLM returns empty or malformed content

**Safeguard**:
```typescript
if (!enhancedContent || enhancedContent.length < 100) {
  throw new Error('Enhanced content is too short or empty');
}
```

### 6. Concurrent Job Overload

**Problem**: Too many jobs running simultaneously

**Safeguard**:
```typescript
@Processor('article-enhancement', {
  concurrency: 2,  // Max 2 jobs in parallel
})
```

### 7. Redis Connection Loss

**Problem**: Redis server unavailable

**Safeguard**:
- BullMQ auto-reconnect
- Jobs persist in Redis (won't be lost)
- Health check endpoint monitors Redis

### 8. Duplicate Enhancement

**Problem**: Same article enhanced multiple times

**Safeguard**:
- Check article status before queuing
- Only queue articles with status=ORIGINAL
- Update status to PROCESSING immediately

### 9. Malformed URLs

**Problem**: Search returns invalid URLs

**Safeguard**:
```typescript
try {
  await axios.get(url, { timeout: 15000 });
} catch (error) {
  this.logger.error(`Failed to scrape ${url}: ${error.message}`);
  throw error;  // Caught by job processor
}
```

### 10. Content Too Short

**Problem**: Scraped content is just navigation/ads

**Safeguard**:
```typescript
if (content.length > 200) {  // Ensure substantial content
  return content;
}
// Try next strategy
```

---

## 6. API Endpoints

### Trigger Enhancement

```http
POST /api/v1/automation/enhance-all
```

**Response**:
```json
{
  "message": "Successfully queued 5 enhancement jobs",
  "queued": 5,
  "jobIds": ["job-1", "job-2", "job-3", "job-4", "job-5"]
}
```

### Enhance Single Article

```http
POST /api/v1/automation/enhance/:id
```

**Response**:
```json
{
  "message": "Enhancement job queued successfully",
  "jobId": "job-123"
}
```

### Check Job Status

```http
GET /api/v1/automation/jobs/:jobId
```

**Response**:
```json
{
  "jobId": "job-123",
  "articleId": "article-uuid",
  "state": "completed",
  "progress": 100,
  "attemptsMade": 1,
  "processedOn": 1704024000000,
  "finishedOn": 1704024060000,
  "failedReason": null
}
```

---

## 7. Testing Strategy

### Manual Testing

```bash
# 1. Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# 2. Start backend
npm run dev:backend

# 3. Scrape articles (Phase 1)
curl -X POST http://localhost:3001/api/v1/scraper/scrape-beyondchats

# 4. Trigger enhancement
curl -X POST http://localhost:3001/api/v1/automation/enhance-all

# 5. Check job status
curl http://localhost:3001/api/v1/automation/jobs/{jobId}

# 6. View enhanced articles
curl http://localhost:3001/api/v1/articles?status=ENHANCED
```

### Unit Tests

```typescript
describe('LLMService', () => {
  it('should build correct prompt', () => {
    const prompt = buildEnhanceArticlePrompt({...});
    expect(prompt).toContain('ORIGINAL ARTICLE');
    expect(prompt).toContain('REFERENCE ARTICLE 1');
  });

  it('should add references section', () => {
    const result = llmService.addReferences(content, refs);
    expect(result).toContain('## References');
  });
});
```

---

## 8. Production Considerations

### Performance

- **Concurrency**: 2 jobs in parallel (configurable)
- **Caching**: Redis stores job state
- **Timeouts**: 15s for scraping, 30s for LLM calls

### Cost Optimization

- **SerpAPI**: $50/month for 5000 searches
- **OpenAI**: ~$0.03 per article (GPT-4 Turbo)
- **Total**: ~$0.04 per article enhanced

### Monitoring

- **Job Queue Dashboard**: BullMQ Board (optional)
- **Logging**: Winston with structured logs
- **Metrics**: Track success/failure rates

### Scalability

- **Horizontal**: Add more workers (stateless)
- **Vertical**: Increase concurrency per worker
- **Redis**: Can handle millions of jobs

---

## Summary

Phase 2 delivers:

✅ **SerpAPI Integration** for reliable Google search  
✅ **Multi-strategy content extraction** with fallbacks  
✅ **Comprehensive LLM prompt** optimized for quality  
✅ **Async job processing** with BullMQ and Redis  
✅ **Production-grade error handling** and retry logic  
✅ **Progress tracking** for long-running jobs  
✅ **Modular architecture** (easy to swap providers)  
✅ **Edge case handling** for robustness  

**Next**: Phase 3 - React Frontend
