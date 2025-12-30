import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArticlesService } from '../articles/articles.service';
import { ScraperStrategy } from './strategies/scraper.interface';
import { BeyondChatsStrategy } from './strategies/beyondchats.strategy';
import { GenericArticleStrategy } from './strategies/generic-article.strategy';

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private readonly strategies: ScraperStrategy[];

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly configService: ConfigService,
    private readonly beyondChatsStrategy: BeyondChatsStrategy,
    private readonly genericArticleStrategy: GenericArticleStrategy,
  ) {
    // Register strategies in priority order
    this.strategies = [this.beyondChatsStrategy, this.genericArticleStrategy];
  }

  /**
   * Scrape articles from BeyondChats blog and store in database
   */
  async scrapeBeyondChats(): Promise<{
    message: string;
    count: number;
    articleIds: string[];
  }> {
    const url = 'https://beyondchats.com/blogs';
    const maxArticles = this.configService.get<number>(
      'scraping.maxArticles',
      5,
    );

    this.logger.log(
      `Starting BeyondChats scraping for ${maxArticles} articles`,
    );

    try {
      const strategy = this.getStrategy(url);
      const scrapedArticles = await strategy.scrape(url, {
        maxArticles,
        timeout: this.configService.get<number>('scraping.timeout', 30000),
        headless: this.configService.get<boolean>(
          'scraping.puppeteerHeadless',
          true,
        ),
      });

      // Store articles in database
      const articleIds: string[] = [];
      for (const scrapedArticle of scrapedArticles) {
        try {
          const article = await this.articlesService.create({
            title: scrapedArticle.title,
            content: scrapedArticle.content,
            sourceUrl: scrapedArticle.sourceUrl,
            status: 'ORIGINAL',
          });
          articleIds.push(article.id);
          this.logger.log(`Stored article: ${article.title} (${article.id})`);
        } catch (error) {
          this.logger.error(`Failed to store article: ${error.message}`);
        }
      }

      return {
        message: `Successfully scraped and stored ${articleIds.length} articles`,
        count: articleIds.length,
        articleIds,
      };
    } catch (error) {
      this.logger.error(`Scraping failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Scrape a single article from any URL
   */
  async scrapeArticle(
    url: string,
  ): Promise<{ message: string; articleId: string }> {
    this.logger.log(`Scraping article from ${url}`);

    try {
      const strategy = this.getStrategy(url);
      const scrapedArticles = await strategy.scrape(url, {
        maxArticles: 1,
        timeout: this.configService.get<number>('scraping.timeout', 30000),
      });

      if (scrapedArticles.length === 0) {
        throw new Error('No article found at URL');
      }

      const scrapedArticle = scrapedArticles[0];
      const article = await this.articlesService.create({
        title: scrapedArticle.title,
        content: scrapedArticle.content,
        sourceUrl: scrapedArticle.sourceUrl,
        status: 'ORIGINAL',
      });

      this.logger.log(`Stored article: ${article.title} (${article.id})`);

      return {
        message: 'Article scraped and stored successfully',
        articleId: article.id,
      };
    } catch (error) {
      this.logger.error(
        `Failed to scrape article: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get appropriate scraping strategy for URL
   */
  private getStrategy(url: string): ScraperStrategy {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(url)) {
        return strategy;
      }
    }

    // Should never happen as GenericArticleStrategy handles all URLs
    throw new Error('No suitable scraping strategy found');
  }
}
