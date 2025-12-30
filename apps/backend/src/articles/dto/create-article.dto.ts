import { IsString, IsUrl, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '@prisma/client';

export class CreateArticleDto {
  @ApiProperty({ description: 'Article title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Article content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Source URL of the article' })
  @IsUrl()
  sourceUrl: string;

  @ApiPropertyOptional({ enum: ArticleStatus, description: 'Article status' })
  @IsEnum(ArticleStatus)
  @IsOptional()
  status?: ArticleStatus;
}
