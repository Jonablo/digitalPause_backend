import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { UsageSession } from '../../sessions/entities/usage-session.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  platform: string; // 'ios' | 'android'

  @Column()
  device_identifier: string; // Unique ID from device

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_locked: boolean; // REMOTE LOCK STATUS

  @Column({ nullable: true })
  fcm_token: string; // Push token for FCM fallback

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.devices)
  user: User;

  @Column()
  user_id: string;

  @OneToMany(() => UsageSession, (session) => session.device)
  sessions: UsageSession[];
}
