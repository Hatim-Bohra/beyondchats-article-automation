import { PartialType } from '@nestjs/swagger';
import { CreateArticleDto } from './create-article.dto';
import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
    @ApiPropertyOptional({ description: 'Enhanced article content' })
    @IsString()
    @IsOptional()
    updatedContent?: string;

    @ApiPropertyOptional({
        description: 'References used for enhancement',
        type: 'array',
        items: {
            type: 'object',
            properties: {
                title: { type: 'string' },
                url: { type: 'string' },
            },
        },
    })
    @IsArray()
    @IsOptional()
    references?: Array<{ title: string; url: string }>;
}
