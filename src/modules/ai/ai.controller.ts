import { Body, Controller, Post, BadRequestException, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';

type ChatMessageDto = {
  role: 'system' | 'assistant' | 'user';
  content: string;
};

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('mood-checkin')
  @ApiOperation({ summary: 'Analyze mood from chat conversation and return assistant reply' })
  @ApiQuery({ name: 'clerkId', required: true })
  async moodCheckin(
    @Query('clerkId') clerkId: string,
    @Body() body: { messages: ChatMessageDto[] },
  ) {
    if (!clerkId) {
      throw new BadRequestException('Clerk ID required');
    }
    if (!body?.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      throw new BadRequestException('messages array is required');
    }

    return this.aiService.analyzeMood(clerkId, body.messages);
  }
}

