import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Organization } from '@/database/entities/organization.entity';

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  STAFF = 'staff',
  APPLICANT = 'applicant',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.APPLICANT,
  })
  role: UserRole;

  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true, type: 'text' })
  memo: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  contractType: string;

  @Column({ nullable: true, type: 'date' })
  hireDate: Date;

  @Column({ nullable: true, type: 'date' })
  resignationDate: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ nullable: true, type: 'int' })
  birthYear: number;

  @Column({ nullable: true })
  hometown: string;

  @Column({ nullable: true })
  residence: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany('Application', 'applicant')
  applications: any[];

  @OneToMany('Selection', 'reviewer')
  selections: any[];

  @OneToMany('Visit', 'visitor')
  visits: any[];

  @OneToMany('AuditLog', 'actor')
  auditLogs: any[];
}
