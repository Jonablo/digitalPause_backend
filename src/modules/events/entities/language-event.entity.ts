import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Child } from '../../children/entities/child.entity';

@Entity('language_events')
export class LanguageEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // We only store the category or keywords, not full text, for privacy
  @Column({ nullable: true })
  detected_text: string; 

  @Column()
  category: string; // 'negative', 'bullying', etc.

  @Column()
  severity: number; // 1-5

  @CreateDateColumn()
  detected_at: Date;

  @ManyToOne(() => Child, (child) => child.language_events)
  child: Child;

  @Column()
  child_id: string;
}
