import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Recommendation } from '../../recommendations/entities/recommendation.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string;

  @CreateDateColumn()
  sent_at: Date;

  @Column({ default: false })
  read: boolean;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

  @Column()
  user_id: string;

  @ManyToOne(() => Recommendation)
  recommendation: Recommendation;

  @Column({ nullable: true })
  recommendation_id: string;
}
