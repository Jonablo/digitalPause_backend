import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [ConfigModule, MetricsModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}

