import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  night_limit_enabled: boolean;

  @Column({ type: 'int', default: 0 })
  max_daily_minutes: number;

  @Column({ default: false })
  language_monitoring: boolean;

  @Column({ type: 'varchar', length: 32, default: 'strict' })
  strictness: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
