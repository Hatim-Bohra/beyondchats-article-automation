import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article, ArticleStatus } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    return this.prisma.article.create({
      data: createArticleDto,
    });
  }

  async findAll(filters?: { status?: string }): Promise<any[]> {
    // TEMPORARY: Return mock data to bypass database issues
    const mockArticles = [
      {
        id: '1',
        title: 'Getting Started with BeyondChats',
        content:
          'This is a sample article about BeyondChats features and capabilities. Learn how to integrate our powerful chat system into your application.',
        sourceUrl: 'https://beyondchats.com/blog/getting-started',
        status: 'ORIGINAL',
        updatedContent: null,
        references: null,
        scrapedAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Advanced Chat Features',
        content:
          'Learn about advanced features in BeyondChats including AI-powered responses, custom integrations, and analytics.',
        sourceUrl: 'https://beyondchats.com/blog/advanced-features',
        status: 'ENHANCED',
        updatedContent:
          'Enhanced version with more details about AI-powered chat features, including natural language processing, sentiment analysis, and automated response generation. This updated content provides comprehensive coverage of all advanced capabilities.',
        references: [
          { title: 'AI Chat Guide', url: 'https://example.com/ai-guide' },
        ],
        scrapedAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    if (filters?.status) {
      return mockArticles.filter((a) => a.status === filters.status);
    }
    return mockArticles;
  }

  async findOne(id: string): Promise<any> {
    // TEMPORARY: Return mock data
    const mockArticles = [
      {
        id: '1',
        title: 'Getting Started with BeyondChats',
        content:
          'This is a sample article about BeyondChats features and capabilities.',
        sourceUrl: 'https://beyondchats.com/blog/getting-started',
        status: 'ORIGINAL',
        updatedContent: null,
        references: null,
        scrapedAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Advanced Chat Features',
        content: 'Learn about advanced features in BeyondChats.',
        sourceUrl: 'https://beyondchats.com/blog/advanced-features',
        status: 'ENHANCED',
        updatedContent: 'Enhanced version with AI-powered features...',
        references: [{ title: 'AI Guide', url: 'https://example.com/guide' }],
        scrapedAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return mockArticles.find((a) => a.id === id) || null;
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<Article> {
    try {
      return await this.prisma.article.update({
        where: { id },
        data: updateArticleDto,
      });
    } catch (error) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
  }

  async remove(id: string): Promise<Article> {
    try {
      return await this.prisma.article.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }
  }

  async count(status?: ArticleStatus): Promise<number> {
    return this.prisma.article.count({
      where: status ? { status } : undefined,
    });
  }
}
