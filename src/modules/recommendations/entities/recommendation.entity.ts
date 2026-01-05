import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('recommendations')
export class Recommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  content_url: string;

  @Column({ nullable: true })
  content_type: string;

  @Column({ default: true })
  active: boolean;
}
