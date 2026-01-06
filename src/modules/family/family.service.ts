import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyRelation } from './entities/family-relation.entity';
import { User } from '../users/entities/user.entity';
import { Device } from '../devices/entities/device.entity';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { FcmService } from '../../messaging/fcm.service';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(FamilyRelation)
    private familyRepository: Repository<FamilyRelation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    private realtimeGateway: RealtimeGateway,
    private fcmService: FcmService,
  ) {}

  // 1. Link Parent to Child via Email
  async linkChild(parentClerkId: string, childEmail: string) {
    const parent = await this.userRepository.findOne({ where: { clerk_id: parentClerkId } });
    if (!parent) throw new NotFoundException('Parent user not found');

    if (parent.email === childEmail) {
        throw new BadRequestException('Cannot link to yourself');
    }

    let child = await this.userRepository.findOne({ where: { email: childEmail } });

    if (!child) {
      child = this.userRepository.create({
        email: childEmail,
        name: childEmail.split('@')[0],
      });
      await this.userRepository.save(child);
    }

    const existingLink = await this.familyRepository.findOne({
      where: { parent_id: parent.id, child_id: child.id },
    });

    if (existingLink) {
        return existingLink;
    }

    const relation = this.familyRepository.create({
      parent: parent,
      child: child,
      parent_id: parent.id,
      child_id: child.id,
      status: 'pending',
      permissions: { lock_device: true, view_reports: true },
    });

    return this.familyRepository.save(relation);
  }

  // (handshake completes)
  async acceptLink(childClerkId: string, parentEmail: string) {
    const child = await this.userRepository.findOne({ where: { clerk_id: childClerkId } });
    if (!child) throw new NotFoundException('Child not found');
    const parent = await this.userRepository.findOne({ where: { email: parentEmail } });
    if (!parent) throw new NotFoundException('Parent not found');
    const relation = await this.familyRepository.findOne({ where: { parent_id: parent.id, child_id: child.id } });
    if (!relation) throw new NotFoundException('Relation not found');
    relation.status = 'active';
    return this.familyRepository.save(relation);
  }

  // 2. Get my linked children (for Parent Dashboard)
  async getMyChildren(parentClerkId: string) {
    const parent = await this.userRepository.findOne({ where: { clerk_id: parentClerkId } });
    if (!parent) throw new NotFoundException('Parent not found');

    const relations = await this.familyRepository.find({
      where: { parent_id: parent.id },
      relations: ['child', 'child.devices', 'child.settings'],
    });

    return relations.map(r => r.child);
  }

  // 3. Remote Lock/Unlock Device
  async toggleDeviceLock(parentClerkId: string, deviceId: string, lock: boolean) {
    const device = await this.deviceRepository.findOne({ 
        where: { id: deviceId },
        relations: ['user']
    });

    if (!device) throw new NotFoundException('Device not found');

    const parent = await this.userRepository.findOne({ where: { clerk_id: parentClerkId } });
    const isMyChild = await this.familyRepository.findOne({
        where: { parent_id: parent.id, child_id: device.user.id }
    });

    if (!isMyChild) {
        throw new BadRequestException('You do not have permission to control this device');
    }

    device.is_locked = lock;
    await this.deviceRepository.save(device);

    // Try realtime via socket
    const emitted = this.realtimeGateway.emitToUser(device.user.id, 'cmd_lock_device', { deviceId, locked: lock });
    if (!emitted && device.fcm_token) {
      await this.fcmService.sendDataMessage(device.fcm_token, {
        cmd: 'lock_device',
        deviceId,
        locked: String(lock),
      });
    }
    return device;
  }

  async registerDeviceToken(userClerkId: string, deviceId: string, fcmToken: string) {
    const user = await this.userRepository.findOne({ where: { clerk_id: userClerkId } });
    if (!user) throw new NotFoundException('User not found');
    const device = await this.deviceRepository.findOne({ where: { id: deviceId, user: { id: user.id } }, relations: ['user'] });
    if (!device) throw new NotFoundException('Device not found for this user');
    device.fcm_token = fcmToken;
    return this.deviceRepository.save(device);
  }
}
