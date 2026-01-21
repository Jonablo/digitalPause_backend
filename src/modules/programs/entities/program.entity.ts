import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  // Formato: "HH:mm" (ej: "13:00")
  @Column({ type: 'time' })
  start_time: string;

  // Formato: "HH:mm" (ej: "14:00")
  @Column({ type: 'time' })
  end_time: string;

  // Días de la semana en que aplica este programa
  // Array de números: 0=Domingo, 1=Lunes, 2=Martes, ..., 6=Sábado
  @Column({ type: 'simple-array', default: '1,2,3,4,5,6,0' })
  days_of_week: number[];

  // ¿El programa está activo?
  @Column({ default: true })
  is_active: boolean;

  // Icono para la UI (opcional)
  @Column({ nullable: true })
  icon: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}