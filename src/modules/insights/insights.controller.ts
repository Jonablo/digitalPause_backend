import { Controller, Post, Get, Query, BadRequestException } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Trigger insight generation (Internal/Cron)' })
  @ApiQuery({ name: 'clerkId', required: true })
  async generate(@Query('clerkId') clerkId: string) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.insightsService.generateInsights(clerkId);
  }

  @Get()
  @ApiOperation({ summary: 'Get user insights' })
  @ApiQuery({ name: 'clerkId', required: true })
  async getInsights(@Query('clerkId') clerkId: string) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.insightsService.getInsights(clerkId);
  }
}
