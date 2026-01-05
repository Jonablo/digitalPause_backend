import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Child } from '../../children/entities/child.entity';
import { Recommendation } from 'src/modules/recommendations/entities/recommendation.entity';


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

  @ManyToOne(() => Child, (child) => child.notifications)
  child: Child;

  @Column()
  child_id: string;

  @ManyToOne(() => Recommendation)
  recommendation: Recommendation;

  @Column({ nullable: true })
  recommendation_id: string;
}
