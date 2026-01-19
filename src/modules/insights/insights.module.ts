import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmotionalMetric } from '../metrics/entities/emotional-metric.entity';
import { InteractionMetric } from '../metrics/entities/interaction-metric.entity';
import { UsageMetric } from '../metrics/entities/usage-metric.entity';
import { User } from '../users/entities/user.entity';
import { Insight } from './entities/insight.entity';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Insight, 
      User,
      UsageMetric,
      InteractionMetric,
      EmotionalMetric
    ]),
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
