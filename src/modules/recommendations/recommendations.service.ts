import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WellnessRecommendation } from './entities/recommendation.entity';
import { User } from '../users/entities/user.entity';
import { Insight } from '../insights/entities/insight.entity';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectRepository(WellnessRecommendation)
    private recommendationRepo: Repository<WellnessRecommendation>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Insight)
    private insightRepo: Repository<Insight>,
  ) {}

  private async getUser(clerkId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { clerk_id: clerkId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getRecommendations(clerkId: string) {
    const user = await this.getUser(clerkId);

    // Get latest insights to filter recommendations
    const latestInsights = await this.insightRepo.find({
        where: { user_id: user.id },
        order: { created_at: 'DESC' },
        take: 3
    });

    const triggers = latestInsights.map(i => i.type);
    
    // If no specific insights, return generic/featured recommendations
    // For now, simple query matching triggers
    let query = this.recommendationRepo.createQueryBuilder('rec')
        .where('rec.active = :active', { active: true });

    if (triggers.length > 0) {
        query = query.andWhere('rec.trigger IN (:...triggers)', { triggers });
    }

    return query.getMany();
  }
}
