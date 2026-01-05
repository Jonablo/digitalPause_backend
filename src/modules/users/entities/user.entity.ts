import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Child } from '../../children/entities/child.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  // External ID from Clerk
  @Column({ unique: true })
  clerk_id: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Child, (child) => child.user)
  children: Child[];
}
