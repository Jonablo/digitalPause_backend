import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Child } from '../../children/entities/child.entity';
import { PauseEvent } from './pause-event.entity';

@Entity('pause_rules')
export class PauseRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // 'time_limit', 'scheduled', 'manual'

  @Column({ nullable: true })
  trigger: string;

  @Column({ default: false })
  is_forced: boolean;

  @Column({ type: 'time', nullable: true })
  start_time: string;

  @Column({ type: 'time', nullable: true })
  end_time: string;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => Child, (child) => child.pause_rules)
  child: Child;

  @Column()
  child_id: string;

  @OneToMany(() => PauseEvent, (event) => event.rule)
  events: PauseEvent[];
}
