import { Controller, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { CreateEmotionDto } from './dto/create-emotion.dto';

@ApiTags('Emotions')
@Controller('emotions')
export class EmotionsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Post()
  @ApiOperation({ summary: 'Log an emotional state' })
  @ApiQuery({ name: 'clerkId', required: true })
  async recordEmotion(
    @Query('clerkId') clerkId: string,
    @Body() body: CreateEmotionDto,
  ) {
    if (!clerkId) throw new BadRequestException('Clerk ID required');
    return this.metricsService.recordEmotion(clerkId, body);
  }
}
