import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('emotional_metrics')
export class EmotionalMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  user_id: string;

  @Column({ type: 'date' })
  record_date: string;

  @Column()
  emotion: string;

  @Column({ type: 'float' })
  confidence: number;

  @CreateDateColumn()
  created_at: Date;
}
