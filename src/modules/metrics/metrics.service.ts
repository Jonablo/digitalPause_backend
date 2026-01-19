import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { UsageMetric } from './entities/usage-metric.entity';
import { InteractionMetric } from './entities/interaction-metric.entity';
import { EmotionalMetric } from './entities/emotional-metric.entity';
import { User } from '../users/entities/user.entity';
import { Settings } from '../users/entities/settings.entity';
import { InsightsService } from '../insights/insights.service';

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
    @InjectRepository(Settings)
    private settingsRepo: Repository<Settings>,
    private insightsService: InsightsService,
  ) {}

  private async getUser(clerkId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { clerk_id: clerkId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async getSettings(user: User): Promise<Settings> {
    let settings = await this.settingsRepo.findOne({ where: { user: { id: user.id } } });
    if (!settings) {
      settings = this.settingsRepo.create({ user: user });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async updateScreenTimeLimit(clerkId: string, data: { dailyLimitSeconds: number; strictness?: string }) {
    const user = await this.getUser(clerkId);
    const settings = await this.getSettings(user);
    
    settings.max_daily_minutes = Math.floor(data.dailyLimitSeconds / 60);
    settings.strictness = data.strictness || settings.strictness || 'strict';
    
    await this.settingsRepo.save(settings);

    return {
      dailyLimitSeconds: settings.max_daily_minutes * 60,
      strictness: settings.strictness,
    };
  }

  async getScreenTimeSummary(clerkId: string) {
    const user = await this.getUser(clerkId);
    const settings = await this.getSettings(user);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const lastUsage = await this.usageRepo.findOne({
      where: {
        user_id: user.id,
        usage_date: todayStr,
      },
      order: { created_at: 'DESC' },
    });

    const usedSeconds = lastUsage?.total_usage_seconds ?? 0;
    // Use settings for limit
    const dailyLimitSeconds = (settings.max_daily_minutes || 0) * 60;

    const remainingSeconds =
      dailyLimitSeconds > 0 && usedSeconds < dailyLimitSeconds
        ? dailyLimitSeconds - usedSeconds
        : 0;

    const usedPercent =
      dailyLimitSeconds > 0
        ? Math.min(100, Math.round((usedSeconds / dailyLimitSeconds) * 100))
        : 0;

    let warningLevel: 'none' | 'warning' | 'critical' = 'none';
    if (dailyLimitSeconds > 0) {
      if (usedPercent >= 100) {
        warningLevel = 'critical';
      } else if (usedPercent >= 80) {
        warningLevel = 'warning';
      }
    }

    return {
      usageDate: todayStr,
      dailyLimitSeconds,
      strictness: settings.strictness,
      usedSeconds,
      remainingSeconds,
      usedPercent,
      warningLevel,
    };
  }

  async getEmotionSummary(clerkId: string) {
    const user = await this.getUser(clerkId);

    const lastEmotion = await this.emotionalRepo.findOne({
      where: { user_id: user.id },
      order: { record_date: 'DESC', created_at: 'DESC' },
    });

    if (!lastEmotion) {
      return {
        level: 'low',
        label: 'Sin datos',
        emotion: null,
        confidence: 0,
        recordDate: null,
      };
    }

    const emotionLower = lastEmotion.emotion.toLowerCase();

    let level: 'low' | 'medium' | 'high' = 'low';

    if (
      emotionLower === 'stress' ||
      emotionLower === 'frustration' ||
      emotionLower === 'anxiety' ||
      emotionLower === 'anger'
    ) {
      level = 'high';
    } else if (emotionLower === 'sadness' || emotionLower === 'worry') {
      level = 'medium';
    } else {
      level = 'low';
    }

    const label =
      level === 'high' ? 'Alto' : level === 'medium' ? 'Medio' : 'Bajo';

    return {
      level,
      label,
      emotion: lastEmotion.emotion,
      confidence: lastEmotion.confidence,
      recordDate: lastEmotion.record_date,
    };
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
    let metric = await this.interactionRepo.findOne({
      where: {
        user_id: user.id,
        record_date: data.recordDate,
      },
    });

    if (metric) {
      metric.taps_count = data.tapsCount;
      metric.scroll_events = data.scrollEvents;
      metric.avg_scroll_speed = data.avgScrollSpeed;
    } else {
      metric = this.interactionRepo.create({
        user,
        user_id: user.id,
        record_date: data.recordDate,
        taps_count: data.tapsCount,
        scroll_events: data.scrollEvents,
        avg_scroll_speed: data.avgScrollSpeed,
      });
    }

    const savedMetric = await this.interactionRepo.save(metric);
    await this.insightsService.generateInsights(clerkId);
    return savedMetric;
  }

  async recordEmotion(clerkId: string, data: any) {
    const user = await this.getUser(clerkId);
    const metric = this.emotionalRepo.create({
      user,
      user_id: user.id,
      record_date: new Date().toISOString().split('T')[0],
      emotion: data.emotion,
      confidence: data.confidence,
    });
    return this.emotionalRepo.save(metric);
  }

  async getInteractionHistory(
    clerkId: string,
    range: 'day' | 'week' | 'month' = 'week',
  ) {
    const user = await this.getUser(clerkId);

    const today = new Date();
    const fromDate = new Date(today);

    if (range === 'week') {
      fromDate.setDate(today.getDate() - 6);
    } else if (range === 'month') {
      fromDate.setDate(today.getDate() - 29);
    }

    const fromDateStr = fromDate.toISOString().split('T')[0];

    const metrics = await this.interactionRepo.find({
      where: {
        user_id: user.id,
        record_date: MoreThanOrEqual(fromDateStr),
      },
      order: { record_date: 'ASC' },
    });

    return metrics;
  }
}
