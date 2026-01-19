import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('wellness_recommendations')
export class WellnessRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  trigger: string; // e.g., 'overuse', 'night_usage'

  @Column()
  category: string; // 'meditation', 'article', 'video'

  @Column()
  content: string;

  @Column({ nullable: true })
  media_url: string;

  @Column({ default: 0 })
  duration_minutes: number;

  @Column({ default: true })
  active: boolean;
}
