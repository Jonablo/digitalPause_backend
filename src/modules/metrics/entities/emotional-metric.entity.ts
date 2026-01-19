import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('emotional_metrics')
export class EmotionalMetric {
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
  emotion: string;

  @Column({ type: 'float' })
  confidence: number;

  @CreateDateColumn()
  created_at: Date;
}
