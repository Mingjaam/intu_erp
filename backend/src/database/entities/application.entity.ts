import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Program } from './program.entity';

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  SELECTED = 'selected',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  programId: string;

  @ManyToOne(() => Program, { nullable: false })
  @JoinColumn({ name: 'programId' })
  program: Program;

  @Column()
  applicantId: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'applicantId' })
  applicant: User;

  @Column('jsonb')
  payload: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
  })
  status: ApplicationStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ default: false })
  isPaymentReceived: boolean;

  @Column({ type: 'timestamp', nullable: true })
  paymentReceivedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne('Selection', 'application')
  selection: any;
}
