import { Controller, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post('usage')
  @ApiOperation({ summary: 'Submit usage metrics' })
  @ApiQuery({ name: 'clerkId', required: true })
  async submitUsage(
    @Query('clerkId') clerkId: string,
    @Body() body: any,
  ) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.metricsService.recordUsage(clerkId, body);
  }

  @Post('interactions')
  @ApiOperation({ summary: 'Submit interaction metrics' })
  @ApiQuery({ name: 'clerkId', required: true })
  async submitInteractions(
    @Query('clerkId') clerkId: string,
    @Body() body: any,
  ) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.metricsService.recordInteractions(clerkId, body);
  }
}
