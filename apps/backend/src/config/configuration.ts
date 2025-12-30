export default () => ({
    port: parseInt(process.env.PORT, 10) || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    database: {
        url: process.env.DATABASE_URL,
    },
    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },
    llm: {
        provider: process.env.LLM_PROVIDER || 'openai',
        openai: {
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
            temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
            maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 4000,
        },
        anthropic: {
            apiKey: process.env.ANTHROPIC_API_KEY,
        },
    },
    search: {
        serpApiKey: process.env.SERPAPI_KEY,
    },
    scraping: {
        puppeteerHeadless: process.env.PUPPETEER_HEADLESS === 'true',
        timeout: parseInt(process.env.SCRAPING_TIMEOUT, 10) || 30000,
        maxArticles: parseInt(process.env.MAX_ARTICLES_TO_SCRAPE, 10) || 5,
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    },
});
