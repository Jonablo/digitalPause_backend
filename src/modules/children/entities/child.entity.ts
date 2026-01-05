import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Device } from '../../devices/entities/device.entity';
import { Settings } from './settings.entity';
import { LanguageEvent } from '../../events/entities/language-event.entity';
import { PauseRule } from '../../events/entities/pause-rule.entity';
import { Notification } from '../../notifications/entities/notification.entity';

@Entity('children')
export class Child {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  age: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.children)
  user: User;

  @Column()
  user_id: string;

  @OneToMany(() => Device, (device) => device.child)
  devices: Device[];

  @OneToOne(() => Settings, (settings) => settings.child)
  settings: Settings;

  @OneToMany(() => LanguageEvent, (event) => event.child)
  language_events: LanguageEvent[];

  @OneToMany(() => PauseRule, (rule) => rule.child)
  pause_rules: PauseRule[];

  @OneToMany(() => Notification, (notification) => notification.child)
  notifications: Notification[];
}
