import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../modules/users/entities/user.entity';
import { Settings } from '../modules/users/entities/settings.entity';
import { UsageMetric } from '../modules/metrics/entities/usage-metric.entity';
import { InteractionMetric } from '../modules/metrics/entities/interaction-metric.entity';
import { EmotionalMetric } from '../modules/metrics/entities/emotional-metric.entity';
import { Insight } from '../modules/insights/entities/insight.entity';
import { WellnessRecommendation } from '../modules/recommendations/entities/recommendation.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASS', 'postgres'),
        database: configService.get<string>('DB_NAME', 'digital_pause'),
        entities: [
          User,
          Settings,
          UsageMetric,
          InteractionMetric,
          EmotionalMetric,
          Insight,
          WellnessRecommendation,
        ],
        synchronize: true, // Only for development
      }),
    }),
  ],
})
export class DatabaseModule {}
