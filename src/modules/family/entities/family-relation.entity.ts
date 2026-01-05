import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('family_relations')
@Unique(['parent', 'child']) // Prevent duplicate links
export class FamilyRelation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.parent_relations)
  parent: User;

  @Column()
  parent_id: string;

  @ManyToOne(() => User, (user) => user.child_relations)
  child: User;

  @Column()
  child_id: string;

  @Column({ default: 'active' }) // pending, active, blocked
  status: string;

  @CreateDateColumn()
  created_at: Date;
}
