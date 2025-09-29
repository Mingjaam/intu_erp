import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from '@/database/entities/program.entity';
import { User, UserRole } from '@/database/entities/user.entity';
import { CreateProgramDto, UpdateProgramDto, ProgramQueryDto } from './dto/program.dto';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createProgramDto: CreateProgramDto, user: User): Promise<Program> {
    // 권한 확인: 관리자 또는 운영자만 프로그램 생성 가능
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.OPERATOR) {
      throw new ForbiddenException('프로그램 생성 권한이 없습니다.');
    }

    const program = this.programRepository.create({
      title: createProgramDto.title,
      description: createProgramDto.description,
      organizerId: createProgramDto.organizerId || user.organizationId,
      status: createProgramDto.status,
      maxParticipants: createProgramDto.maxParticipants,
      applyStart: new Date(createProgramDto.applyStart),
      applyEnd: new Date(createProgramDto.applyEnd),
      programStart: new Date(createProgramDto.programStart),
      programEnd: new Date(createProgramDto.programEnd),
      location: createProgramDto.location,
      fee: createProgramDto.fee,
      applicationForm: createProgramDto.applicationForm,
      metadata: createProgramDto.metadata,
    });

    return await this.programRepository.save(program);
  }

  // 프로그램 상태를 자동으로 계산하는 메서드
  private calculateProgramStatus(program: Program): string {
    const now = new Date();
    const applyStart = new Date(program.applyStart);
    const applyEnd = new Date(program.applyEnd);
    const programStart = program.programStart ? new Date(program.programStart) : null;
    const programEnd = program.programEnd ? new Date(program.programEnd) : null;

    console.log(`프로그램 상태 계산: ${program.title}`);
    console.log(`현재 시간: ${now.toISOString()}`);
    console.log(`신청 시작: ${applyStart.toISOString()}`);
    console.log(`신청 종료: ${applyEnd.toISOString()}`);
    console.log(`활동 시작: ${programStart?.toISOString() || 'null'}`);
    console.log(`활동 종료: ${programEnd?.toISOString() || 'null'}`);
    console.log(`현재 상태: ${program.status}`);

    // 수동으로 설정된 상태가 'draft' 또는 'archived'인 경우 그대로 유지
    if (program.status === 'draft' || program.status === 'archived') {
      console.log(`수동 설정 상태 유지: ${program.status}`);
      return program.status;
    }

    // 신청 기간 전
    if (now < applyStart) {
      console.log('상태: 신청 전 (draft)');
      return 'draft'; // 신청 시작 전
    }
    
    // 신청 기간 중
    if (now >= applyStart && now <= applyEnd) {
      console.log('상태: 모집중 (open)');
      return 'open'; // 모집 중
    }
    
    // 신청 기간 종료 후, 활동 시작 전
    if (now > applyEnd && programStart && now < programStart) {
      console.log('상태: 신청마감 (closed)');
      return 'closed'; // 신청 마감, 활동 시작 전
    }
    
    // 활동 기간 중
    if (programStart && programEnd && now >= programStart && now <= programEnd) {
      console.log('상태: 진행중 (ongoing)');
      return 'ongoing'; // 진행 중
    }
    
    // 활동 종료 후
    if (programEnd && now > programEnd) {
      console.log('상태: 완료 (completed)');
      return 'completed'; // 완료
    }
    
    // 활동 기간이 설정되지 않은 경우
    if (!programStart && !programEnd) {
      console.log('상태: 신청마감 (closed) - 활동 기간 미설정');
      return 'closed'; // 신청 마감
    }
    
    console.log('상태: 신청마감 (closed) - 기본값');
    return 'closed';
  }

  // 프로그램 상태를 업데이트하는 메서드
  private async updateProgramStatus(program: Program): Promise<Program> {
    console.log(`=== 상태 업데이트 시작: ${program.title} ===`);
    const calculatedStatus = this.calculateProgramStatus(program);
    console.log(`계산된 상태: ${calculatedStatus}, 현재 상태: ${program.status}`);
    
    if (calculatedStatus !== program.status) {
      console.log(`상태 변경: ${program.status} -> ${calculatedStatus}`);
      program.status = calculatedStatus as any;
      const savedProgram = await this.programRepository.save(program);
      console.log(`상태 업데이트 완료: ${savedProgram.status}`);
      return savedProgram;
    } else {
      console.log(`상태 변경 없음: ${program.status}`);
    }
    
    return program;
  }

  async findAll(query: ProgramQueryDto, user: User | null): Promise<{ programs: Program[]; total: number }> {
    console.log('=== findAll 메서드 호출됨 ===');
    const { status, organizerId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.organizer', 'organizer')
      .leftJoinAndSelect('program.applications', 'applications')
      .leftJoinAndSelect('applications.selection', 'selection')
      .where('program.isActive = :isActive', { isActive: true });

    // 일반 사용자는 공개된 프로그램만 조회 가능
    if (user && user.role === UserRole.APPLICANT) {
      queryBuilder.andWhere('program.status = :status', { status: 'open' });
    }

    // 관리자/운영자는 자신의 기관 프로그램만 조회
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.OPERATOR) && user.organizationId) {
      queryBuilder.andWhere('program.organizerId = :userOrganizationId', { userOrganizationId: user.organizationId });
    }

    if (status) {
      queryBuilder.andWhere('program.status = :status', { status });
    }

    if (organizerId) {
      queryBuilder.andWhere('program.organizerId = :organizerId', { organizerId });
    }

    const [programs, total] = await queryBuilder
      .orderBy('program.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // 각 프로그램의 상태를 자동으로 업데이트
    console.log(`프로그램 개수: ${programs.length}`);
    const updatedPrograms = await Promise.all(
      programs.map(async (program) => {
        console.log(`프로그램 처리 시작: ${program.title}`);
        return await this.updateProgramStatus(program);
      })
    );

    // 각 프로그램에 대한 통계 정보 및 모집 마감까지 남은 일수 계산
    const programsWithStats = updatedPrograms.map(program => {
      const selectedCount = program.applications.filter(app => 
        app.selection && app.selection.selected
      ).length;
      
      // 모집 마감까지 남은 일수 계산
      const now = new Date();
      const applyEnd = new Date(program.applyEnd);
      const daysUntilDeadline = Math.ceil((applyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`프로그램: ${program.title}, 마감일: ${applyEnd.toISOString()}, 남은 일수: ${daysUntilDeadline}`);
      
      return {
        ...program,
        applicationCount: program.applications.length,
        selectedCount,
        revenue: selectedCount * program.fee,
        daysUntilDeadline, // 모집 마감까지 남은 일수
      };
    });

    // 모집 마감까지 남은 일수 기준으로 정렬 (마감 임박한 것이 위에)
    const sortedPrograms = programsWithStats.sort((a, b) => {
      // 모집 중인 프로그램만 마감일 기준으로 정렬
      if (a.status === 'open' && b.status === 'open') {
        return a.daysUntilDeadline - b.daysUntilDeadline;
      }
      // 모집 중인 프로그램이 우선
      if (a.status === 'open' && b.status !== 'open') return -1;
      if (a.status !== 'open' && b.status === 'open') return 1;
      // 같은 상태면 생성일 기준 내림차순
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { programs: sortedPrograms, total };
  }

  async findOne(id: string, user: User | null): Promise<Program> {
    const program = await this.programRepository.findOne({
      where: { id, isActive: true },
      relations: ['organizer', 'applications', 'applications.applicant'],
    });

    if (!program) {
      throw new NotFoundException('프로그램을 찾을 수 없습니다.');
    }

    // 프로그램 상태를 자동으로 업데이트
    const updatedProgram = await this.updateProgramStatus(program);

    // 로그인되지 않은 사용자는 공개된 프로그램만 조회 가능
    if (!user && updatedProgram.status !== 'open') {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    // 일반 사용자(신청자)는 공개된 프로그램만 조회 가능
    if (user && user.role === UserRole.APPLICANT && updatedProgram.status !== 'open') {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    // 관리자는 모든 프로그램 조회 가능, 운영자/직원은 자신의 기관 프로그램만 조회 가능
    if (user && (user.role === UserRole.OPERATOR) && user.organizationId) {
      if (updatedProgram.organizerId !== user.organizationId) {
        throw new ForbiddenException('이 프로그램에 접근할 권한이 없습니다.');
      }
    }

    return updatedProgram;
  }

  async update(id: string, updateProgramDto: UpdateProgramDto, user: User): Promise<Program> {
    const program = await this.findOne(id, user);

    // 권한 확인: 관리자, 운영자, 또는 해당 조직의 사용자만 수정 가능
    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.OPERATOR &&
      program.organizerId !== user.organizationId
    ) {
      throw new ForbiddenException('프로그램 수정 권한이 없습니다.');
    }

    // organizerId는 업데이트하지 않음 (보안상의 이유)
    const { ...updateData } = updateProgramDto;

    // 날짜 필드 처리
    if (updateData.applyStart) {
      updateData.applyStart = new Date(updateData.applyStart) as any;
    }
    if (updateData.applyEnd) {
      updateData.applyEnd = new Date(updateData.applyEnd) as any;
    }
    if (updateData.programStart) {
      updateData.programStart = new Date(updateData.programStart) as any;
    }
    if (updateData.programEnd) {
      updateData.programEnd = new Date(updateData.programEnd) as any;
    }

    Object.assign(program, updateData);
    return await this.programRepository.save(program);
  }

  async remove(id: string, user: User): Promise<void> {
    const program = await this.findOne(id, user);

    // 권한 확인: 관리자 또는 운영자만 삭제 가능
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.OPERATOR) {
      throw new ForbiddenException('프로그램 삭제 권한이 없습니다.');
    }

    program.isActive = false;
    await this.programRepository.save(program);
  }

  async getProgramStats(id: string, user: User): Promise<any> {
    const program = await this.findOne(id, user);

    const stats = await this.programRepository
      .createQueryBuilder('program')
      .leftJoin('program.applications', 'application')
      .leftJoin('application.selection', 'selection')
      .where('program.id = :id', { id })
      .select([
        'COUNT(DISTINCT application.id) as totalApplications',
        'COUNT(DISTINCT CASE WHEN selection.selected = true THEN selection.id END) as selectedCount',
        'COUNT(DISTINCT CASE WHEN application.status = :submitted THEN application.id END) as submittedCount',
        'COUNT(DISTINCT CASE WHEN application.status = :underReview THEN application.id END) as underReviewCount',
      ])
      .setParameters({
        submitted: 'submitted',
        underReview: 'under_review',
      })
      .getRawOne();

    return {
      programId: id,
      programTitle: program.title,
      ...stats,
    };
  }
}
