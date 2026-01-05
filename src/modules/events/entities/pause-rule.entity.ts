import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
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

  @ManyToOne(() => User, (user) => user.pause_rules)
  user: User;

  @Column()
  user_id: string;

  @OneToMany(() => PauseEvent, (event) => event.rule)
  events: PauseEvent[];
}
