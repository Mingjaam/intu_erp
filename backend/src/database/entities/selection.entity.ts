import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity('selections')
export class Selection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  applicationId: string;

  @OneToOne('Application', {
    nullable: false,
  })
  @JoinColumn({ name: 'applicationId' })
  application: any;

  @Column()
  selected: boolean;

  @Column('text', { nullable: true })
  reason: string;

  @Column()
  reviewerId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column({ type: 'timestamp' })
  reviewedAt: Date;

  @Column('jsonb', { nullable: true })
  criteria: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
