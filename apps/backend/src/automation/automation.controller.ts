import {
  Controller,
  Post,
  Get,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AutomationService } from './automation.service';

@ApiTags('automation')
@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) { }

  @Post('enhance-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enhance all articles with status ORIGINAL' })
  @ApiResponse({
    status: 200,
    description: 'Enhancement jobs queued successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        queued: { type: 'number' },
        jobIds: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async enhanceAll() {
    return this.automationService.enhanceAllOriginalArticles();
  }

  @Post('enhance/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enhance a specific article' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({
    status: 200,
    description: 'Enhancement job queued successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        jobId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async enhanceOne(@Param('id') id: string) {
    return this.automationService.enhanceArticle(id);
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get job status' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.automationService.getJobStatus(jobId);
  }
}
