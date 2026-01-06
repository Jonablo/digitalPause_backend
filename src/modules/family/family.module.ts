import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { FamilyRelation } from './entities/family-relation.entity';
import { User } from '../users/entities/user.entity';
import { Device } from '../devices/entities/device.entity';
import { RealtimeModule } from '../../realtime/realtime.module';
import { MessagingModule } from '../../messaging/messaging.module';

@Module({
  imports: [TypeOrmModule.forFeature([FamilyRelation, User, Device]), RealtimeModule, MessagingModule],
  controllers: [FamilyController],
  providers: [FamilyService],
})
export class FamilyModule {}
