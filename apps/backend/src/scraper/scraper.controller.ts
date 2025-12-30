import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ScraperService } from './scraper.service';
import { IsUrl, IsOptional } from 'class-validator';

class ScrapeUrlDto {
  @IsUrl()
  url: string;
}

@ApiTags('scraper')
@Controller('automation')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) { }

  @Post('scrape-beyondchats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Scrape 5 oldest articles from BeyondChats blog' })
  @ApiResponse({
    status: 200,
    description: 'Articles scraped and stored successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        count: { type: 'number' },
        articleIds: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({ status: 500, description: 'Scraping failed' })
  async scrapeBeyondChats() {
    return this.scraperService.scrapeBeyondChats();
  }

  @Post('scrape-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Scrape a single article from any URL' })
  @ApiBody({ type: ScrapeUrlDto })
  @ApiResponse({
    status: 200,
    description: 'Article scraped and stored successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        articleId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid URL' })
  @ApiResponse({ status: 500, description: 'Scraping failed' })
  async scrapeUrl(@Body() dto: ScrapeUrlDto) {
    return this.scraperService.scrapeArticle(dto.url);
  }
}
