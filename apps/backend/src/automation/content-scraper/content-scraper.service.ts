import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
}

@Injectable()
export class ContentScraperService {
  private readonly logger = new Logger(ContentScraperService.name);

  /**
   * Scrape main content from an article URL
   */
  async scrapeArticle(url: string): Promise<ScrapedContent> {
    this.logger.log(`Scraping content from: ${url}`);

    try {
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract title
      const title = this.extractTitle($);

      // Extract main content
      const content = this.extractMainContent($);

      this.logger.log(`Scraped ${content.length} characters from ${url}`);

      return {
        title,
        content,
        url,
      };
    } catch (error) {
      this.logger.error(`Failed to scrape ${url}: ${error.message}`);
      throw new Error(`Failed to scrape article: ${error.message}`);
    }
  }

  /**
   * Extract title from page
   */
  private extractTitle($: cheerio.CheerioAPI): string {
    return (
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      'Untitled'
    );
  }

  /**
   * Extract main content using multiple strategies
   */
  private extractMainContent($: cheerio.CheerioAPI): string {
    // Strategy 1: Try common article containers
    const contentSelectors = [
      'article',
      '[role="main"]',
      'main',
      '.article-content',
      '.post-content',
      '.entry-content',
      '.content',
      '#content',
      '.article-body',
      '.post-body',
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const content = this.cleanContent($, element);
        if (content.length > 200) {
          // Ensure substantial content
          return content;
        }
      }
    }

    // Strategy 2: Find largest text block
    const textBlocks = $('div, section, article')
      .map((_, el) => {
        const clone = $(el).clone();
        // Remove nested divs to avoid double counting
        clone.find('div, section, article').remove();
        const text = clone.text().trim();
        return { element: el, text, length: text.length };
      })
      .get()
      .filter((block) => block.length > 200)
      .sort((a, b) => b.length - a.length);

    if (textBlocks.length > 0) {
      const content = this.cleanContent($, $(textBlocks[0].element));
      if (content.length > 200) {
        return content;
      }
    }

    // Strategy 3: Fallback to all paragraphs
    const paragraphs = $('p')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter((text) => text.length > 50)
      .join('\n\n');

    return paragraphs || 'Content not available';
  }

  /**
   * Clean extracted content
   */
  private cleanContent(
    $: cheerio.CheerioAPI,
    element: cheerio.Cheerio<any>,
  ): string {
    // Clone to avoid modifying original
    const clone = element.clone();

    // Remove unwanted elements
    clone
      .find(
        'script, style, nav, header, footer, aside, iframe, .ad, .advertisement, .social-share, .comments, .related-posts, [class*="sidebar"], [class*="widget"]',
      )
      .remove();

    // Get text content
    let text = clone.text();

    // Clean up whitespace
    text = text
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .join('\n\n');

    // Remove excessive newlines
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
  }
}
