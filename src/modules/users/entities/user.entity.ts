import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  clerk_id: string;

  @Column({ type: 'int', nullable: true })
  daily_limit_seconds: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  strictness: string | null;

  @CreateDateColumn()
  created_at: Date;
}
