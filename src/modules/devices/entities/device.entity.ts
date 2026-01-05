import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Child } from '../../children/entities/child.entity';
import { UsageSession } from 'src/modules/sessions/entities/usage-session.entity';


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

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Child, (child) => child.devices)
  child: Child;

  @Column()
  child_id: string;

  @OneToMany(() => UsageSession, (session) => session.device)
  sessions: UsageSession[];
}
