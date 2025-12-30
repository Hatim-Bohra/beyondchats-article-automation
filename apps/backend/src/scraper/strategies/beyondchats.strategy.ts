import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import {
  ScraperStrategy,
  ScraperOptions,
  ScrapedArticle,
} from './scraper.interface';

@Injectable()
export class BeyondChatsStrategy implements ScraperStrategy {
  private readonly logger = new Logger(BeyondChatsStrategy.name);
  private readonly BASE_URL = 'https://beyondchats.com/blogs';

  canHandle(url: string): boolean {
    return url.includes('beyondchats.com/blogs');
  }

  async scrape(
    url: string,
    options?: ScraperOptions,
  ): Promise<ScrapedArticle[]> {
    const maxArticles = options?.maxArticles || 5;
    const timeout = options?.timeout || 30000;
    const headless = options?.headless ?? true;

    this.logger.log(
      `Starting scrape of ${url} for ${maxArticles} oldest articles`,
    );

    let browser: Browser | null = null;

    try {
      // Launch browser
      browser = await puppeteer.launch({
        headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(timeout);

      // Navigate to blogs page
      this.logger.log('Navigating to blogs page...');
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Find last page number
      const lastPageNumber = await this.findLastPage(page);
      this.logger.log(`Found ${lastPageNumber} total pages`);

      // Navigate to last page
      if (lastPageNumber > 1) {
        this.logger.log(`Navigating to page ${lastPageNumber}...`);
        await this.navigateToPage(page, lastPageNumber);
      }

      // Extract articles from last page
      const articles = await this.extractArticles(page, maxArticles);
      this.logger.log(`Successfully scraped ${articles.length} articles`);

      return articles;
    } catch (error) {
      this.logger.error(`Scraping failed: ${error.message}`, error.stack);
      throw new Error(`Failed to scrape BeyondChats blog: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private async findLastPage(page: Page): Promise<number> {
    try {
      // Try to find pagination elements
      // Common selectors for pagination
      const paginationSelectors = [
        '.pagination a:last-child',
        '.pagination li:last-child a',
        'nav[aria-label="pagination"] a:last-child',
        '.page-numbers:last-child',
      ];

      for (const selector of paginationSelectors) {
        const lastPageElement = await page.$(selector);
        if (lastPageElement) {
          const lastPageText = await page.evaluate(
            (el) => el.textContent,
            lastPageElement,
          );
          const pageNumber = parseInt(lastPageText?.trim() || '1', 10);
          if (!isNaN(pageNumber)) {
            return pageNumber;
          }
        }
      }

      // If no pagination found, assume single page
      this.logger.warn('No pagination found, assuming single page');
      return 1;
    } catch (error) {
      this.logger.warn(`Error finding last page: ${error.message}`);
      return 1;
    }
  }

  private async navigateToPage(page: Page, pageNumber: number): Promise<void> {
    try {
      // Common pagination URL patterns
      const paginationPatterns = [
        `${this.BASE_URL}?page=${pageNumber}`,
        `${this.BASE_URL}/page/${pageNumber}`,
        `${this.BASE_URL}?p=${pageNumber}`,
      ];

      // Try each pattern
      for (const url of paginationPatterns) {
        try {
          await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });

          // Verify we're on the correct page
          const currentPage = await this.getCurrentPageNumber(page);
          if (currentPage === pageNumber) {
            return;
          }
        } catch (error) {
          this.logger.debug(`Failed to navigate with pattern: ${url}`);
        }
      }

      throw new Error(`Could not navigate to page ${pageNumber}`);
    } catch (error) {
      this.logger.error(
        `Navigation to page ${pageNumber} failed: ${error.message}`,
      );
      throw error;
    }
  }

  private async getCurrentPageNumber(page: Page): Promise<number> {
    try {
      const activePageSelectors = [
        '.pagination .active',
        '.pagination li.active a',
        'nav[aria-label="pagination"] .current',
      ];

      for (const selector of activePageSelectors) {
        const activeElement = await page.$(selector);
        if (activeElement) {
          const pageText = await page.evaluate(
            (el) => el.textContent,
            activeElement,
          );
          const pageNumber = parseInt(pageText?.trim() || '1', 10);
          if (!isNaN(pageNumber)) {
            return pageNumber;
          }
        }
      }

      return 1;
    } catch (error) {
      return 1;
    }
  }

  private async extractArticles(
    page: Page,
    maxArticles: number,
  ): Promise<ScrapedArticle[]> {
    try {
      // Common article selectors
      const articleSelectors = [
        'article',
        '.post',
        '.blog-post',
        '.article-item',
        '[class*="article"]',
        '[class*="post"]',
      ];

      let articleElements = null;
      for (const selector of articleSelectors) {
        articleElements = await page.$$(selector);
        if (articleElements && articleElements.length > 0) {
          this.logger.log(
            `Found ${articleElements.length} articles using selector: ${selector}`,
          );
          break;
        }
      }

      if (!articleElements || articleElements.length === 0) {
        throw new Error('No articles found on page');
      }

      // Extract data from each article (limit to maxArticles)
      const articles: ScrapedArticle[] = [];
      const articlesToProcess = Math.min(articleElements.length, maxArticles);

      for (let i = 0; i < articlesToProcess; i++) {
        const element = articleElements[i];

        try {
          const article = await page.evaluate((el) => {
            // Extract title
            const titleElement =
              el.querySelector('h1') ||
              el.querySelector('h2') ||
              el.querySelector('h3') ||
              el.querySelector('.title') ||
              el.querySelector('[class*="title"]');
            const title = titleElement?.textContent?.trim() || 'Untitled';

            // Extract content
            const contentElement =
              el.querySelector('.content') ||
              el.querySelector('.excerpt') ||
              el.querySelector('p') ||
              el.querySelector('[class*="content"]');
            const content = contentElement?.textContent?.trim() || '';

            // Extract URL
            const linkElement = el.querySelector('a');
            let url = linkElement?.getAttribute('href') || '';

            // Make URL absolute if relative
            if (url && !url.startsWith('http')) {
              url = new URL(url, window.location.origin).href;
            }

            // Extract author
            const authorElement =
              el.querySelector('.author') ||
              el.querySelector('[class*="author"]') ||
              el.querySelector('[rel="author"]');
            const author = authorElement?.textContent?.trim();

            // Extract date
            const dateElement =
              el.querySelector('time') ||
              el.querySelector('.date') ||
              el.querySelector('[class*="date"]');
            const dateStr =
              dateElement?.getAttribute('datetime') ||
              dateElement?.textContent?.trim();

            return {
              title,
              content,
              sourceUrl: url,
              author,
              publishedAt: dateStr,
            };
          }, element);

          // Parse date if available
          let publishedAt: Date | undefined;
          if (article.publishedAt) {
            const parsedDate = new Date(article.publishedAt);
            if (!isNaN(parsedDate.getTime())) {
              publishedAt = parsedDate;
            }
          }

          // Only add if we have at least title and URL
          if (article.title && article.sourceUrl) {
            articles.push({
              title: article.title,
              content: article.content,
              sourceUrl: article.sourceUrl,
              author: article.author,
              publishedAt,
            });
          }
        } catch (error) {
          this.logger.warn(
            `Failed to extract article ${i + 1}: ${error.message}`,
          );
        }
      }

      return articles;
    } catch (error) {
      this.logger.error(`Article extraction failed: ${error.message}`);
      throw error;
    }
  }
}
