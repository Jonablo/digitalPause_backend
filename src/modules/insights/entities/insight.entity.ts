import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('insights')
export class Insight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  type: string; // 'overuse', 'fatigue', 'stimulation', etc.

  @Column()
  message: string;

  @Column()
  severity: string; // 'low', 'medium', 'high'

  @Column({ type: 'date' })
  related_date: string;

  @CreateDateColumn()
  created_at: Date;
}
