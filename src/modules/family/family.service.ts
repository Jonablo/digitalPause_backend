import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FamilyRelation } from './entities/family-relation.entity';
import { User } from '../users/entities/user.entity';
import { Device } from '../devices/entities/device.entity';

@Injectable()
export class FamilyService {
  constructor(
    @InjectRepository(FamilyRelation)
    private familyRepository: Repository<FamilyRelation>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
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
      // Create Shadow User (Pending Signup)
      // This allows the link to exist even if the child hasn't installed the app yet.
      // When they sign up with this email, they will inherit this user ID or we handle merge.
      // For simplicity here: we assume they will claim this email.
      child = this.userRepository.create({
        email: childEmail,
        name: childEmail.split('@')[0],
      });
      await this.userRepository.save(child);
    }

    // Check if link already exists
    const existingLink = await this.familyRepository.findOne({
      where: { parent_id: parent.id, child_id: child.id },
    });

    if (existingLink) {
        return existingLink;
    }

    const relation = this.familyRepository.create({
      parent: parent,
      child: child,
      // Explicitly set IDs to satisfy potential TypeORM sync issues or column constraints
      parent_id: parent.id,
      child_id: child.id,
      status: 'active', // Or 'pending' if we want 2-way handshake
    });

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
    // Verify that this device belongs to a child of this parent
    // This is a crucial security check!
    const device = await this.deviceRepository.findOne({ 
        where: { id: deviceId },
        relations: ['user']
    });

    if (!device) throw new NotFoundException('Device not found');

    // Check relationship
    const parent = await this.userRepository.findOne({ where: { clerk_id: parentClerkId } });
    const isMyChild = await this.familyRepository.findOne({
        where: { parent_id: parent.id, child_id: device.user.id }
    });

    if (!isMyChild) {
        throw new BadRequestException('You do not have permission to control this device');
    }

    device.is_locked = lock;
    return this.deviceRepository.save(device);
  }
}
