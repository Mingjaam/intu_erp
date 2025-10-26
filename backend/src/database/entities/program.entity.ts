import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from '@/database/entities/organization.entity';

export enum ProgramStatus {
  BEFORE_APPLICATION = 'before_application', // 신청전
  APPLICATION_OPEN = 'application_open',     // 신청중
  IN_PROGRESS = 'in_progress',              // 진행중
  COMPLETED = 'completed',                  // 완료
  ARCHIVED = 'archived',                   // 보관
}

@Entity('programs')
export class Program {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ nullable: true })
  summary: string;

  @Column()
  organizerId: string;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'organizerId' })
  organizer: Organization;

  @Column({
    type: 'enum',
    enum: ProgramStatus,
    default: ProgramStatus.BEFORE_APPLICATION,
  })
  status: ProgramStatus;

  @Column({ type: 'timestamp' })
  applyStart: Date;

  @Column({ type: 'timestamp' })
  applyEnd: Date;

  @Column({ type: 'timestamp' })
  programStart: Date;

  @Column({ type: 'timestamp' })
  programEnd: Date;

  @Column()
  location: string;

  @Column({ type: 'int', default: 0 })
  fee: number;

  @Column({ type: 'int', default: 20 })
  maxParticipants: number;

  @Column('jsonb', { nullable: true })
  applicationForm: Record<string, any>;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  revenue: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany('Application', 'program')
  applications: any[];

  @OneToMany('Visit', 'program')
  visits: any[];
}
