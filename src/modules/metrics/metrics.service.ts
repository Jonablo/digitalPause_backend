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
    
    // Determine the base strictness mode (strip existing offset if any)
    const currentMode = (settings.strictness || 'strict').split('|')[0];
    const newMode = data.strictness || currentMode;

    // Get current usage to set as offset
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Try to find usage by date first
    let usage = await this.usageRepo.findOne({
      where: {
        user_id: user.id,
        usage_date: todayStr,
      },
      order: { created_at: 'DESC' },
    });

    // Fallback: If no usage found for "today" (UTC), check if there's a recent record 
    // from the last 12 hours that might match local time "today"
    if (!usage) {
      const recentUsage = await this.usageRepo.findOne({
        where: { user_id: user.id },
        order: { created_at: 'DESC' },
      });
      
      if (recentUsage) {
        const now = new Date();
        const diffHours = (now.getTime() - recentUsage.created_at.getTime()) / (1000 * 60 * 60);
        // If created within last 12 hours, assume it's the relevant "today" record
        if (diffHours < 12) {
          usage = recentUsage;
        }
      }
    }
    
    const currentUsage = usage?.total_usage_seconds ?? 0;
    
    // Store offset in strictness field: "mode|offset"
    // This guarantees persistence without requiring a schema migration for a new column
    const strictnessValue = `${newMode}|${currentUsage}`;
    settings.strictness = strictnessValue;
    
    // Remove reliance on non-existent column to prevent DB errors
    // settings.offset_usage_seconds = currentUsage; 

    await this.settingsRepo.save(settings);
    
    // Verify persistence (debug)
    // console.log('Saved settings:', settings.strictness);

    return {
      dailyLimitSeconds: settings.max_daily_minutes * 60,
      strictness: newMode,
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

    // Fallback logic for getScreenTimeSummary as well
    let effectiveLastUsage = lastUsage;
    if (!effectiveLastUsage) {
      const recentUsage = await this.usageRepo.findOne({
        where: { user_id: user.id },
        order: { created_at: 'DESC' },
      });
      if (recentUsage) {
        const now = new Date();
        const diffHours = (now.getTime() - recentUsage.created_at.getTime()) / (1000 * 60 * 60);
        if (diffHours < 12) {
          effectiveLastUsage = recentUsage;
        }
      }
    }

    const usedSeconds = effectiveLastUsage?.total_usage_seconds ?? 0;
    // Use settings for limit
    const dailyLimitSeconds = (settings.max_daily_minutes || 0) * 60;

    // Retrieve offset from strictness field ("mode|offset") or the column
    const strictnessParts = (settings.strictness || 'strict').split('|');
    const mode = strictnessParts[0];
    const offsetFromStrictness = strictnessParts[1] ? parseInt(strictnessParts[1], 10) : 0;
    
    // Use the stored offset (prioritize strictness field as it's reliable without migration)
    const offset = offsetFromStrictness || 0;
    
    // Calculate effective usage relative to the offset
    // If usedSeconds < offset (e.g. new day started but offset remains from yesterday), reset effective to usedSeconds
    // We assume if usedSeconds dropped, it's a new day
    const effectiveUsedSeconds = usedSeconds >= offset ? usedSeconds - offset : usedSeconds;

    const remainingSeconds =
      dailyLimitSeconds > 0 && effectiveUsedSeconds < dailyLimitSeconds
        ? dailyLimitSeconds - effectiveUsedSeconds
        : 0;

    const usedPercent =
      dailyLimitSeconds > 0
        ? Math.min(100, Math.round((effectiveUsedSeconds / dailyLimitSeconds) * 100))
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
      strictness: mode, // Return only the mode (strict/flexible) to frontend
      usedSeconds: effectiveUsedSeconds, // Return effective usage for UI to match the countdown
      totalUsedSeconds: usedSeconds,     // Return total usage for "Total Usage" display if needed
      remainingSeconds,
      usedPercent,
      warningLevel,
      nightUsage: lastUsage?.night_usage || false,
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
    
    // Check for existing record to avoid duplicates
    let metric = await this.usageRepo.findOne({
      where: {
        user_id: user.id,
        usage_date: data.usageDate,
      },
      order: { created_at: 'DESC' },
    });

    if (metric) {
      metric.total_usage_seconds = data.totalUsageSeconds;
      metric.sessions_count = data.sessionsCount;
      metric.longest_session_seconds = data.longestSessionSeconds;
      metric.night_usage = data.nightUsage;
    } else {
      metric = this.usageRepo.create({
        user,
        user_id: user.id,
        usage_date: data.usageDate,
        total_usage_seconds: data.totalUsageSeconds,
        sessions_count: data.sessionsCount,
        longest_session_seconds: data.longestSessionSeconds,
        night_usage: data.nightUsage,
      });
    }
    
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

  async getBlockingRisk(clerkId: string) {
    const user = await this.getUser(clerkId);

    // Screen time component
    const screen = await this.getScreenTimeSummary(clerkId);
    const baselineSeconds = 4 * 3600; // 4h baseline if no limit configured
    const screenRisk = screen.dailyLimitSeconds > 0
      ? screen.usedPercent
      : Math.min(100, Math.round((screen.usedSeconds / baselineSeconds) * 100));

    // Interaction component (today)
    const todayStr = new Date().toISOString().split('T')[0];
    const lastInteraction = await this.interactionRepo.findOne({
      where: { user_id: user.id, record_date: todayStr },
      order: { created_at: 'DESC' },
    });
    const totalInteractions = (lastInteraction?.taps_count || 0) + (lastInteraction?.scroll_events || 0);
    let interactionRisk = 0;
    if (totalInteractions >= 1700) interactionRisk = 100;
    else if (totalInteractions >= 1200) interactionRisk = 85;
    else if (totalInteractions >= 800) interactionRisk = 60;
    else interactionRisk = Math.round(Math.min(40, (totalInteractions / 800) * 40));

    // Emotion component (last record)
    const emotion = await this.getEmotionSummary(clerkId);
    const emotionRisk = emotion.level === 'high' ? 90 : emotion.level === 'medium' ? 60 : 20;

    // Weighted composite risk
    const percent = Math.min(100, Math.round(0.5 * screenRisk + 0.3 * interactionRisk + 0.2 * emotionRisk));
    const level: 'low' | 'medium' | 'high' | 'critical' =
      percent >= 90 ? 'critical' : percent >= 70 ? 'high' : percent >= 40 ? 'medium' : 'low';

    return {
      percent,
      level,
      usedPercent: screen.usedPercent,
      totalInteractions,
      avgScrollSpeed: lastInteraction?.avg_scroll_speed || 0,
      emotionLevel: emotion.level,
      usageDate: screen.usageDate,
      nightUsage: screen.nightUsage,
    };
  }
}
