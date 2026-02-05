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
import { Program } from '../modules/programs/entities/program.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';
        
        const useSSL = configService.get<string>('DB_SSL', 'false') === 'true';
        
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASS'),
          database: configService.get<string>('DB_NAME'),
          entities: [
            User,
            Settings,
            UsageMetric,
            InteractionMetric,
            EmotionalMetric,
            Insight,
            WellnessRecommendation,
            Program,
          ],
          synchronize: !isProduction,
          logging: configService.get<string>('LOG_LEVEL') === 'debug',
          ssl: useSSL ? { rejectUnauthorized: false } : false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}