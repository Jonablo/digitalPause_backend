import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { PauseRule } from './pause-rule.entity';
import { Device } from '../../devices/entities/device.entity';

@Entity('pause_events')
export class PauseEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reason: string;

  @CreateDateColumn()
  triggered_at: Date;

  @ManyToOne(() => PauseRule, (rule) => rule.events)
  rule: PauseRule;

  @Column()
  pause_rule_id: string;

  @ManyToOne(() => Device)
  device: Device;

  @Column()
  device_id: string;
}
