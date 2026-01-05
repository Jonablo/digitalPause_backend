import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Child } from './child.entity';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  night_limit_enabled: boolean;

  @Column({ default: 120 }) // Minutes
  max_daily_minutes: number;

  @Column({ default: false })
  language_monitoring: boolean;

  @OneToOne(() => Child, (child) => child.settings)
  @JoinColumn({ name: 'child_id' })
  child: Child;

  @Column()
  child_id: string;
}
