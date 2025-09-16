import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum OrganizationType {
  VILLAGE = 'village',
  INSTITUTION = 'institution',
  COMPANY = 'company',
  NGO = 'ngo',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: OrganizationType,
    default: OrganizationType.VILLAGE,
  })
  type: OrganizationType;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany('User', 'organization')
  users: any[];

  @OneToMany('Program', 'organizer')
  programs: any[];

  @OneToMany('Visit', 'organization')
  visits: any[];
}
