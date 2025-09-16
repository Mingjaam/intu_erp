import { DataSource } from 'typeorm';
import { User, UserRole } from '../src/database/entities/user.entity';
import { Organization, OrganizationType } from '../src/database/entities/organization.entity';
import { Program, ProgramStatus } from '../src/database/entities/program.entity';
import { Application } from '../src/database/entities/application.entity';
import { Selection } from '../src/database/entities/selection.entity';
import { Visit } from '../src/database/entities/visit.entity';
import { AuditLog } from '../src/database/entities/audit-log.entity';
import * as bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [
    User,
    Organization,
    Program,
    Application,
    Selection,
    Visit,
    AuditLog,
  ],
  synchronize: true,
  logging: true,
});

async function seedData() {
  try {
    await AppDataSource.initialize();
    console.log('데이터베이스 연결 성공');

    const userRepository = AppDataSource.getRepository(User);
    const organizationRepository = AppDataSource.getRepository(Organization);
    const programRepository = AppDataSource.getRepository(Program);

    // 기존 데이터 삭제
    await programRepository.delete({});
    await userRepository.delete({});
    await organizationRepository.delete({});

    // 조직 생성
    const company = organizationRepository.create({
      name: '인투 ERP 본사',
      type: OrganizationType.COMPANY,
      address: '서울시 강남구 테헤란로 123',
      contact: '02-1234-5678',
      description: '인투 ERP 시스템 운영 본사',
    });

    const village = organizationRepository.create({
      name: '서울시 마을회관',
      type: OrganizationType.VILLAGE,
      address: '서울시 강서구 마을길 456',
      contact: '02-2345-6789',
      description: '서울시 강서구 마을회관',
    });

    const savedOrganizations = await organizationRepository.save([company, village]);

    // 사용자 생성
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = userRepository.create({
      email: 'admin@intu.com',
      passwordHash: hashedPassword,
      name: '관리자',
      role: UserRole.ADMIN,
      organizationId: savedOrganizations[0].id,
    });

    const operator = userRepository.create({
      email: 'operator@intu.com',
      passwordHash: hashedPassword,
      name: '운영자',
      role: UserRole.OPERATOR,
      organizationId: savedOrganizations[0].id,
    });

    const applicant = userRepository.create({
      email: 'user@example.com',
      passwordHash: hashedPassword,
      name: '홍길동',
      role: UserRole.APPLICANT,
      phone: '010-1234-5678',
    });

    await userRepository.save([admin, operator, applicant]);

    // 프로그램 생성
    const program1 = programRepository.create({
      title: '2024년 디지털 리터러시 교육 프로그램',
      description: '디지털 시대에 필요한 기본적인 컴퓨터 사용법과 인터넷 활용법을 교육하는 프로그램입니다. 초보자도 쉽게 따라할 수 있도록 구성되어 있습니다.',
      organizerId: savedOrganizations[0].id,
      status: ProgramStatus.OPEN,
      maxParticipants: 30,
      applyStart: new Date('2024-01-01'),
      applyEnd: new Date('2024-12-31'),
      programStart: new Date('2024-02-01'),
      programEnd: new Date('2024-04-30'),
      location: '인투 ERP 본사 교육실',
      fee: 50000,
      applicationForm: {
        fields: [
          { name: 'name', type: 'text', label: '이름', required: true },
          { name: 'age', type: 'number', label: '나이', required: true },
          { name: 'experience', type: 'select', label: '컴퓨터 사용 경험', options: ['없음', '기초', '중급', '고급'], required: true },
        ],
      },
      metadata: {
        duration: '3개월',
        schedule: '주 2회',
        maxParticipants: 30,
      },
    });

    const program2 = programRepository.create({
      title: '마을 공동체 활성화 프로젝트',
      description: '마을 주민들의 소통과 협력을 증진시키기 위한 다양한 활동을 진행하는 프로그램입니다. 환경 정화, 문화 행사, 자원봉사 등을 포함합니다.',
      organizerId: savedOrganizations[1].id,
      status: ProgramStatus.OPEN,
      maxParticipants: 50,
      applyStart: new Date('2024-02-01'),
      applyEnd: new Date('2024-11-30'),
      programStart: new Date('2024-03-01'),
      programEnd: new Date('2024-08-31'),
      location: '서울시 마을회관',
      fee: 0,
      applicationForm: {
        fields: [
          { name: 'name', type: 'text', label: '이름', required: true },
          { name: 'address', type: 'text', label: '주소', required: true },
          { name: 'interests', type: 'checkbox', label: '관심 분야', options: ['환경', '문화', '자원봉사', '교육'], required: true },
        ],
      },
      metadata: {
        duration: '6개월',
        schedule: '주 1회',
        maxParticipants: 50,
      },
    });

    await programRepository.save([program1, program2]);

    console.log('초기 데이터 생성 완료!');
    console.log('관리자 계정: admin@intu.com / password123');
    console.log('운영자 계정: operator@intu.com / password123');
    console.log('일반 사용자: user@example.com / password123');

  } catch (error) {
    console.error('데이터 생성 오류:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedData();
