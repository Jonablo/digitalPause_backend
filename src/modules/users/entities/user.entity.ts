import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinTable } from 'typeorm';
import { Device } from '../../devices/entities/device.entity';
import { Settings } from './settings.entity'; 
import { FamilyRelation } from '../../family/entities/family-relation.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { LanguageEvent } from '../../events/entities/language-event.entity';
import { PauseRule } from '../../events/entities/pause-rule.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  // External ID from Clerk
  @Column({ unique: true, nullable: true })
  clerk_id: string;

  @CreateDateColumn()
  created_at: Date;

  // I am the parent in these relations
  @OneToMany(() => FamilyRelation, (relation) => relation.parent)
  parent_relations: FamilyRelation[];

  // I am the child in these relations
  @OneToMany(() => FamilyRelation, (relation) => relation.child)
  child_relations: FamilyRelation[];

  // My devices
  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];

  // My settings
  @OneToMany(() => Settings, (settings) => settings.user)
  settings: Settings[];

  // My Notifications
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // My Language Analysis Events
  @OneToMany(() => LanguageEvent, (event) => event.user)
  language_events: LanguageEvent[];

  // My Pause Rules
  @OneToMany(() => PauseRule, (rule) => rule.user)
  pause_rules: PauseRule[];
}
