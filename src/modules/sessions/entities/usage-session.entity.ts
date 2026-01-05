import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Device } from '../../devices/entities/device.entity';

@Entity('usage_sessions')
export class UsageSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  started_at: Date;

  @Column({ nullable: true })
  ended_at: Date;

  @Column({ default: 0 })
  duration_minutes: number;

  @Column({ default: false })
  night_usage: boolean;

  @ManyToOne(() => Device, (device) => device.sessions)
  device: Device;

  @Column()
  device_id: string;
}
