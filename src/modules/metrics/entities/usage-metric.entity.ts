import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('usage_metrics')
export class UsageMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  user_id: string;

  @Column({ type: 'date' })
  usage_date: string;

  @Column()
  total_usage_seconds: number;

  @Column()
  sessions_count: number;

  @Column()
  longest_session_seconds: number;

  @Column({ default: false })
  night_usage: boolean;

  @CreateDateColumn()
  created_at: Date;
}
