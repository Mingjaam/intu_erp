import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum VisitStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed',
}

@Entity('visits')
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  organizationId: string;

  @ManyToOne('Organization', { nullable: false })
  @JoinColumn({ name: 'organizationId' })
  organization: any;

  @Column()
  programId: string;

  @ManyToOne('Program', { nullable: false })
  @JoinColumn({ name: 'programId' })
  program: any;

  @Column()
  visitorId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'visitorId' })
  visitor: User;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  performedAt: Date;

  @Column('text', { nullable: true })
  notes: string;

  @Column('jsonb', { nullable: true })
  outcome: Record<string, any>;

  @Column({
    type: 'enum',
    enum: VisitStatus,
    default: VisitStatus.SCHEDULED,
  })
  status: VisitStatus;

  @Column('text', { nullable: true })
  followUpNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
