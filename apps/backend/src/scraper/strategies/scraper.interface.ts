export interface ScraperStrategy {
    /**
     * Check if this strategy can handle the given URL
     */
    canHandle(url: string): boolean;

    /**
     * Scrape articles from the given URL
     * @param url - The URL to scrape
     * @param options - Optional scraping configuration
     */
    scrape(url: string, options?: ScraperOptions): Promise<ScrapedArticle[]>;
}

export interface ScraperOptions {
    maxArticles?: number;
    timeout?: number;
    headless?: boolean;
}

export interface ScrapedArticle {
    title: string;
    content: string;
    sourceUrl: string;
    author?: string;
    publishedAt?: Date;
}
