import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: false })
  night_limit_enabled: boolean;

  @Column({ default: 120 }) // Minutes
  max_daily_minutes: number;

  @Column({ default: false })
  language_monitoring: boolean;

  // Settings belong to a User (1:1)
  @OneToOne(() => User, (user) => user.settings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: string;
}
