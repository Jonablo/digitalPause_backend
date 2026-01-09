import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Insight } from './entities/insight.entity';
import { User } from '../users/entities/user.entity';
import { UsageMetric } from '../metrics/entities/usage-metric.entity';
import { InteractionMetric } from '../metrics/entities/interaction-metric.entity';
import { EmotionalMetric } from '../metrics/entities/emotional-metric.entity';

@Injectable()
export class InsightsService {
  constructor(
    @InjectRepository(Insight)
    private insightRepo: Repository<Insight>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UsageMetric)
    private usageRepo: Repository<UsageMetric>,
    @InjectRepository(InteractionMetric)
    private interactionRepo: Repository<InteractionMetric>,
    @InjectRepository(EmotionalMetric)
    private emotionalRepo: Repository<EmotionalMetric>,
  ) {}

  private async getUser(clerkId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { clerk_id: clerkId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getInsights(clerkId: string) {
    const user = await this.getUser(clerkId);
    return this.insightRepo.find({
      where: { user_id: user.id },
      order: { created_at: 'DESC' },
      take: 20,
    });
  }

  async generateInsights(clerkId: string) {
    const user = await this.getUser(clerkId);
    
    // 1. Analyze Usage
    const lastUsage = await this.usageRepo.findOne({
      where: { user_id: user.id },
      order: { usage_date: 'DESC' },
    });

    if (lastUsage) {
      const dateStr = lastUsage.usage_date.toString();
      if (lastUsage.night_usage) {
        await this.createInsight(user, 'fatigue', 'Uso nocturno detectado. Tu descanso es vital.', 'medium', dateStr);
      }
      if (lastUsage.total_usage_seconds > 14400) { // > 4 hours
        await this.createInsight(user, 'overuse', 'Has usado el móvil más de 4 horas hoy.', 'high', dateStr);
      }
      if (lastUsage.longest_session_seconds > 3600) { // > 1 hour continuous
        await this.createInsight(user, 'focus_strain', 'Sesiones muy largas sin pausas.', 'medium', dateStr);
      }
    }

    // 2. Analyze Interactions
    const lastInteraction = await this.interactionRepo.findOne({
      where: { user_id: user.id },
      order: { record_date: 'DESC' },
    });

    if (lastInteraction) {
       const dateStr = lastInteraction.record_date.toString();
       if (lastInteraction.scroll_events > 1500) {
          await this.createInsight(user, 'stimulation', 'Nivel de scroll muy alto. Posible doomscrolling.', 'high', dateStr);
       }
       if (lastInteraction.taps_count > 2000) {
          await this.createInsight(user, 'high_interaction', 'Interactividad intensa detectada.', 'low', dateStr);
       }
    }

    // 3. Analyze Emotions (Last 3 days)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const recentEmotions = await this.emotionalRepo.find({
        where: { 
            user_id: user.id,
            created_at: MoreThanOrEqual(threeDaysAgo)
        }
    });

    const negativeEmotions = recentEmotions.filter(e => 
        ['frustration', 'anxiety', 'sadness', 'anger', 'stress'].includes(e.emotion.toLowerCase())
    );

    if (negativeEmotions.length >= 2) {
        await this.createInsight(user, 'emotional_strain', 'Emociones negativas recurrentes recientes.', 'high', new Date().toISOString().split('T')[0]);
    }

    return { status: 'Insights generated' };
  }

  private async createInsight(user: User, type: string, message: string, severity: string, date: string) {
    // Avoid duplicates for same day/type
    const existing = await this.insightRepo.findOne({
        where: { user_id: user.id, type, related_date: date }
    });

    if (!existing) {
        const insight = this.insightRepo.create({
            user,
            user_id: user.id,
            type,
            message,
            severity,
            related_date: date
        });
        await this.insightRepo.save(insight);
    }
  }
}
