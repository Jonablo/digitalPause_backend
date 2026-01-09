import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageMetric } from './entities/usage-metric.entity';
import { InteractionMetric } from './entities/interaction-metric.entity';
import { EmotionalMetric } from './entities/emotional-metric.entity';
import { User } from '../users/entities/user.entity';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsageMetric,
      InteractionMetric,
      EmotionalMetric,
      User,
    ]),
  ],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
