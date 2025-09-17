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

    // 각 프로그램에 대한 통계 정보 추가
    const programsWithStats = programs.map(program => {
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

    // 일반 사용자는 공개된 프로그램만 조회 가능
    if (user && user.role === UserRole.APPLICANT && program.status !== 'open') {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    // 관리자/운영자는 자신의 기관 프로그램만 조회 가능
    if (user && (user.role === UserRole.ADMIN || user.role === UserRole.OPERATOR) && user.organizationId) {
      if (program.organizerId !== user.organizationId) {
        throw new ForbiddenException('이 프로그램에 접근할 권한이 없습니다.');
      }
    }

    return program;
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
