import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article, ArticleStatus } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) { }

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    return this.prisma.article.create({
      data: createArticleDto,
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    status?: ArticleStatus;
  }): Promise<Article[]> {
    const { skip, take, status } = params || {};

    return this.prisma.article.findMany({
      skip,
      take,
      where: status ? { status } : undefined,
      orderBy: { scrapedAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    return article;
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
