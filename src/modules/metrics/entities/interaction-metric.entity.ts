import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('interaction_metrics')
export class InteractionMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'date' })
  record_date: string;

  @Column()
  taps_count: number;

  @Column()
  scroll_events: number;

  @Column({ type: 'float', nullable: true })
  avg_scroll_speed: number;

  @CreateDateColumn()
  created_at: Date;
}
