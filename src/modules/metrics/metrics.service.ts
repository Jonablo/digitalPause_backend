import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageMetric } from './entities/usage-metric.entity';
import { InteractionMetric } from './entities/interaction-metric.entity';
import { EmotionalMetric } from './entities/emotional-metric.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(UsageMetric)
    private usageRepo: Repository<UsageMetric>,
    @InjectRepository(InteractionMetric)
    private interactionRepo: Repository<InteractionMetric>,
    @InjectRepository(EmotionalMetric)
    private emotionalRepo: Repository<EmotionalMetric>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private async getUser(clerkId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { clerk_id: clerkId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async recordUsage(clerkId: string, data: any) {
    const user = await this.getUser(clerkId);
    const metric = this.usageRepo.create({
      user,
      user_id: user.id,
      usage_date: data.usageDate,
      total_usage_seconds: data.totalUsageSeconds,
      sessions_count: data.sessionsCount,
      longest_session_seconds: data.longestSessionSeconds,
      night_usage: data.nightUsage,
    });
    return this.usageRepo.save(metric);
  }

  async recordInteractions(clerkId: string, data: any) {
    const user = await this.getUser(clerkId);
    const metric = this.interactionRepo.create({
      user,
      user_id: user.id,
      record_date: data.recordDate,
      taps_count: data.tapsCount,
      scroll_events: data.scrollEvents,
      avg_scroll_speed: data.avgScrollSpeed,
    });
    return this.interactionRepo.save(metric);
  }

  async recordEmotion(clerkId: string, data: any) {
    const user = await this.getUser(clerkId);
    const metric = this.emotionalRepo.create({
      user,
      user_id: user.id,
      record_date: new Date().toISOString().split('T')[0], // Default to today
      emotion: data.emotion,
      confidence: data.confidence,
    });
    return this.emotionalRepo.save(metric);
  }
}
