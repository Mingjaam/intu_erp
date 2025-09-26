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

    // 수동으로 설정된 상태가 'draft' 또는 'archived'인 경우 그대로 유지
    if (program.status === 'draft' || program.status === 'archived') {
      return program.status;
    }

    // 신청 기간 전
    if (now < applyStart) {
      return 'draft'; // 신청 시작 전
    }
    
    // 신청 기간 중
    if (now >= applyStart && now <= applyEnd) {
      return 'open'; // 모집 중
    }
    
    // 신청 기간 종료 후, 활동 시작 전
    if (now > applyEnd && programStart && now < programStart) {
      return 'closed'; // 신청 마감, 활동 시작 전
    }
    
    // 활동 기간 중
    if (programStart && programEnd && now >= programStart && now <= programEnd) {
      return 'ongoing'; // 진행 중
    }
    
    // 활동 종료 후
    if (programEnd && now > programEnd) {
      return 'completed'; // 완료
    }
    
    // 활동 기간이 설정되지 않은 경우
    if (!programStart && !programEnd) {
      return 'closed'; // 신청 마감
    }
    
    return 'closed';
  }

  // 프로그램 상태를 업데이트하는 메서드
  private async updateProgramStatus(program: Program): Promise<Program> {
    const calculatedStatus = this.calculateProgramStatus(program);
    
    if (calculatedStatus !== program.status) {
      program.status = calculatedStatus as any;
      return await this.programRepository.save(program);
    }
    
    return program;
  }

  async findAll(query: ProgramQueryDto, user: User | null): Promise<{ programs: Program[]; total: number }> {
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
    const updatedPrograms = await Promise.all(
      programs.map(program => this.updateProgramStatus(program))
    );

    // 각 프로그램에 대한 통계 정보 추가
    const programsWithStats = updatedPrograms.map(program => {
      const selectedCount = program.applications.filter(app => 
        app.selection && app.selection.selected
      ).length;
      
      return {
        ...program,
        applicationCount: program.applications.length,
        selectedCount,
        revenue: selectedCount * program.fee,
      };
    });

    return { programs: programsWithStats, total };
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

    // 관리자/운영자는 자신의 기관 프로그램만 조회 가능
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.OPERATOR) && user.organizationId) {
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
