import { Controller, Post, Body, Query, BadRequestException, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { CreateUsageMetricDto } from './dto/create-usage-metric.dto';
import { CreateInteractionMetricDto } from './dto/create-interaction-metric.dto';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post('usage')
  @ApiOperation({ summary: 'Submit usage metrics' })
  @ApiQuery({ name: 'clerkId', required: true })
  async submitUsage(
    @Query('clerkId') clerkId: string,
    @Body() body: CreateUsageMetricDto,
  ) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.metricsService.recordUsage(clerkId, body);
  }

  @Post('interactions')
  @ApiOperation({ summary: 'Submit interaction metrics' })
  @ApiQuery({ name: 'clerkId', required: true })
  async submitInteractions(
    @Query('clerkId') clerkId: string,
    @Body() body: CreateInteractionMetricDto,
  ) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.metricsService.recordInteractions(clerkId, body);
  }

  @Post('screen-time-limit')
  @ApiOperation({ summary: 'Set daily screen time limit for user' })
  @ApiQuery({ name: 'clerkId', required: true })
  async setScreenTimeLimit(
    @Query('clerkId') clerkId: string,
    @Body() body: { dailyLimitSeconds: number; strictness?: string },
  ) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    if (typeof body.dailyLimitSeconds !== 'number' || body.dailyLimitSeconds <= 0) {
      throw new BadRequestException('dailyLimitSeconds must be a positive number');
    }
    return this.metricsService.updateScreenTimeLimit(clerkId, body);
  }

  @Get('interactions')
  @ApiOperation({ summary: 'Get interaction metrics history' })
  @ApiQuery({ name: 'clerkId', required: true })
  @ApiQuery({ name: 'range', required: false, enum: ['day', 'week', 'month'] })
  async getInteractions(
    @Query('clerkId') clerkId: string,
    @Query('range') range: 'day' | 'week' | 'month' = 'week',
  ) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.metricsService.getInteractionHistory(clerkId, range);
  }

  @Get('screen-time-summary')
  @ApiOperation({ summary: 'Get today screen time usage vs configured limit' })
  @ApiQuery({ name: 'clerkId', required: true })
  async getScreenTimeSummary(@Query('clerkId') clerkId: string) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.metricsService.getScreenTimeSummary(clerkId);
  }
}
