import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { User } from '../modules/users/entities/user.entity';
import { Child } from '../modules/children/entities/child.entity';
import { Device } from '../modules/devices/entities/device.entity';
import { Settings } from '../modules/children/entities/settings.entity';
import { UsageSession } from '../modules/sessions/entities/usage-session.entity';
import { LanguageEvent } from '../modules/events/entities/language-event.entity';
import { PauseRule } from '../modules/events/entities/pause-rule.entity';
import { PauseEvent } from '../modules/events/entities/pause-event.entity';
import { Notification } from '../modules/notifications/entities/notification.entity';
import { Recommendation } from '../modules/recommendations/entities/recommendation.entity';

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
          User, Child, Device, Settings, UsageSession, 
          LanguageEvent, PauseRule, PauseEvent, Notification, Recommendation
        ],
        synchronize: true, // Only for development
      }),
    }),
  ],
})
export class DatabaseModule {}
