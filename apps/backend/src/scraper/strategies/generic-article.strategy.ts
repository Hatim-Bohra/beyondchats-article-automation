import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import axios from 'axios';
import {
  ScraperStrategy,
  ScraperOptions,
  ScrapedArticle,
} from './scraper.interface';

@Injectable()
export class GenericArticleStrategy implements ScraperStrategy {
  private readonly logger = new Logger(GenericArticleStrategy.name);

  canHandle(url: string): boolean {
    // This is a fallback strategy for any URL
    return true;
  }

  async scrape(
    url: string,
    options?: ScraperOptions,
  ): Promise<ScrapedArticle[]> {
    const timeout = options?.timeout || 30000;

    this.logger.log(`Scraping article from ${url}`);

    try {
      // Fetch HTML
      const response = await axios.get(url, {
        timeout,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract title
      const title =
        $('h1').first().text().trim() ||
        $('meta[property="og:title"]').attr('content') ||
        $('title').text().trim() ||
        'Untitled';

      // Extract main content
      const content = this.extractMainContent($);

      // Extract author
      const author =
        $('meta[name="author"]').attr('content') ||
        $('[rel="author"]').text().trim() ||
        $('.author').text().trim() ||
        undefined;

      // Extract published date
      let publishedAt: Date | undefined;
      const dateStr =
        $('meta[property="article:published_time"]').attr('content') ||
        $('time').attr('datetime') ||
        $('.date').text().trim();

      if (dateStr) {
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate;
        }
      }

      this.logger.log(`Successfully scraped article: ${title}`);

      return [
        {
          title,
          content,
          sourceUrl: url,
          author,
          publishedAt,
        },
      ];
    } catch (error) {
      this.logger.error(`Failed to scrape ${url}: ${error.message}`);
      throw new Error(`Failed to scrape article: ${error.message}`);
    }
  }

  private extractMainContent($: cheerio.CheerioAPI): string {
    // Try to find main content container
    const contentSelectors = [
      'article',
      '.article-content',
      '.post-content',
      '.entry-content',
      'main',
      '[role="main"]',
      '.content',
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        // Remove unwanted elements
        element
          .find(
            'script, style, nav, header, footer, aside, .ad, .advertisement',
          )
          .remove();

        // Get text content
        const text = element.text().trim();
        if (text.length > 100) {
          // Ensure we have substantial content
          return text;
        }
      }
    }

    // Fallback: get all paragraph text
    const paragraphs = $('p')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((text) => text.length > 20)
      .join('\n\n');

    return paragraphs || 'Content not available';
  }
}
