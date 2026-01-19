import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { WellnessRecommendation } from './entities/recommendation.entity';
import { User } from '../users/entities/user.entity';
import { Insight } from '../insights/entities/insight.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WellnessRecommendation,
      User,
      Insight
    ]),
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
