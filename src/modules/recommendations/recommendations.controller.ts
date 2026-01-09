import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get contextual wellness recommendations' })
  @ApiQuery({ name: 'clerkId', required: true })
  async getRecommendations(@Query('clerkId') clerkId: string) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.recommendationsService.getRecommendations(clerkId);
  }
}
