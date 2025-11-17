import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program, ProgramStatus } from '@/database/entities/program.entity';
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
    // 권한 확인: 관리자, 운영자, 직원만 프로그램 생성 가능
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.OPERATOR && user.role !== UserRole.STAFF) {
      throw new ForbiddenException('프로그램 생성 권한이 없습니다.');
    }

    const program = this.programRepository.create({
      title: createProgramDto.title,
      summary: createProgramDto.summary,
      description: createProgramDto.description,
      organizerId: createProgramDto.organizerId || user.organizationId,
      status: createProgramDto.status || ProgramStatus.BEFORE_APPLICATION, // 제공된 상태가 있으면 사용, 없으면 기본값
      maxParticipants: createProgramDto.maxParticipants,
      applyStart: new Date(createProgramDto.applyStart),
      applyEnd: new Date(createProgramDto.applyEnd),
      programStart: new Date(createProgramDto.programStart),
      programEnd: new Date(createProgramDto.programEnd),
      location: createProgramDto.location,
      fee: createProgramDto.fee,
      imageUrl: createProgramDto.imageUrl,
      additionalImageUrl: createProgramDto.additionalImageUrl,
      applicationForm: createProgramDto.applicationForm,
      metadata: createProgramDto.metadata,
    });

    const savedProgram = await this.programRepository.save(program);
    
    // 저장 후 상태를 자동으로 계산하여 업데이트
    return await this.updateProgramStatus(savedProgram);
  }

  // 프로그램 상태를 자동으로 계산하는 메서드
  private calculateProgramStatus(program: Program): ProgramStatus {
    // 한국 시간 기준 현재 시간
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
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

    // 수동으로 설정된 상태가 'archived'인 경우 그대로 유지
    if (program.status === ProgramStatus.ARCHIVED) {
      console.log(`수동 설정 상태 유지: ${program.status}`);
      return program.status;
    }

    // 기존 상태를 새로운 상태로 변환하는 로직
    let calculatedStatus: ProgramStatus;
    
    // 신청 기간 전
    if (now < applyStart) {
      console.log('상태: 신청 전 (before_application)');
      calculatedStatus = ProgramStatus.BEFORE_APPLICATION;
    }
    // 신청 기간 중
    else if (now >= applyStart && now <= applyEnd) {
      console.log('상태: 신청 중 (application_open)');
      calculatedStatus = ProgramStatus.APPLICATION_OPEN;
    }
    // 신청 기간 종료 후, 활동 시작 전
    else if (now > applyEnd && programStart && now < programStart) {
      console.log('상태: 진행 중 (in_progress) - 신청 마감 후 활동 시작 전');
      calculatedStatus = ProgramStatus.IN_PROGRESS;
    }
    // 활동 기간 중
    else if (programStart && programEnd && now >= programStart && now <= programEnd) {
      console.log('상태: 진행 중 (in_progress)');
      calculatedStatus = ProgramStatus.IN_PROGRESS;
    }
    // 활동 종료 후
    else if (programEnd && now > programEnd) {
      console.log('상태: 완료 (completed)');
      calculatedStatus = ProgramStatus.COMPLETED;
    }
    // 활동 기간이 설정되지 않은 경우
    else {
      console.log('상태: 진행 중 (in_progress) - 기본값');
      calculatedStatus = ProgramStatus.IN_PROGRESS;
    }

    // 기존 상태와 새로운 상태 매핑
    const statusMapping: Record<string, ProgramStatus> = {
      'draft': ProgramStatus.BEFORE_APPLICATION,
      'open': ProgramStatus.APPLICATION_OPEN,
      'closed': ProgramStatus.IN_PROGRESS,
      'ongoing': ProgramStatus.IN_PROGRESS,
      'completed': ProgramStatus.COMPLETED,
      'archived': ProgramStatus.ARCHIVED,
    };

    // 기존 상태인 경우 매핑된 상태 반환, 아니면 계산된 상태 반환
    if (statusMapping[program.status]) {
      console.log(`기존 상태 매핑: ${program.status} -> ${statusMapping[program.status]}`);
      return statusMapping[program.status];
    }

    return calculatedStatus;
  }

  // 프로그램 상태를 업데이트하는 메서드
  private async updateProgramStatus(program: Program): Promise<Program> {
    console.log(`=== 상태 업데이트 시작: ${program.title} ===`);
    const calculatedStatus = this.calculateProgramStatus(program);
    console.log(`계산된 상태: ${calculatedStatus}, 현재 상태: ${program.status}`);
    
    if (calculatedStatus !== program.status) {
      console.log(`상태 변경: ${program.status} -> ${calculatedStatus}`);
      program.status = calculatedStatus;
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

    // 관리자/운영자/직원인지 확인 (신청서 정보 포함 여부 결정)
    const isAdminUser = user && (user.role === UserRole.ADMIN || user.role === UserRole.OPERATOR || user.role === UserRole.STAFF);

    const queryBuilder = this.programRepository
      .createQueryBuilder('program')
      .leftJoinAndSelect('program.organizer', 'organizer')
      .where('program.isActive = :isActive', { isActive: true });

    // 관리자/운영자/직원만 신청서 정보 조인
    if (isAdminUser) {
      queryBuilder
        .leftJoinAndSelect('program.applications', 'applications')
        .leftJoinAndSelect('applications.selection', 'selection');
    }

    // 일반 사용자는 공개된 프로그램만 조회 가능 (기존 상태와 새로운 상태 모두 지원)
    if (user && user.role === UserRole.APPLICANT) {
      queryBuilder.andWhere('(program.status = :applicationOpen OR program.status = :open)', { 
        applicationOpen: ProgramStatus.APPLICATION_OPEN,
        open: ProgramStatus.OPEN 
      });
    }

    // 관리자/운영자/직원은 자신의 기관 프로그램만 조회
    if (isAdminUser && user.organizationId) {
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
      // 관리자/운영자/직원인 경우에만 신청서 정보 사용
      let selectedCount = 0;
      let applicationCount = 0;
      
      if (isAdminUser && program.applications) {
        selectedCount = program.applications.filter(app => 
          app.selection && app.selection.selected
        ).length;
        applicationCount = program.applications.length;
      } else {
        // 공개 API의 경우 별도 쿼리로 통계만 조회 (신청서 정보는 포함하지 않음)
        // applicationCount는 나중에 별도 API로 제공하거나 제거
        applicationCount = 0;
        selectedCount = 0;
      }
      
      // 모집 마감까지 남은 일수 계산
      const now = new Date();
      const applyEnd = new Date(program.applyEnd);
      const daysUntilDeadline = Math.ceil((applyEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`프로그램: ${program.title}, 마감일: ${applyEnd.toISOString()}, 남은 일수: ${daysUntilDeadline}`);
      
      // 응답 객체 생성 (민감한 정보 필터링)
      const programResponse: any = {
        id: program.id,
        title: program.title,
        summary: program.summary,
        description: program.description,
        status: program.status,
        organizerId: program.organizerId,
        organizer: {
          id: program.organizer?.id,
          name: program.organizer?.name,
          type: program.organizer?.type,
          // 주소, 연락처 등 민감한 정보 제외
        },
        applyStart: program.applyStart,
        applyEnd: program.applyEnd,
        programStart: program.programStart,
        programEnd: program.programEnd,
        location: program.location,
        fee: program.fee,
        maxParticipants: program.maxParticipants,
        imageUrl: program.imageUrl,
        additionalImageUrl: program.additionalImageUrl,
        isActive: program.isActive,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
        applicationCount,
        selectedCount,
        revenue: isAdminUser ? (selectedCount * program.fee) : 0,
        daysUntilDeadline,
        // applicationForm은 공개 API에서 제외 (신청 시에만 필요)
        // applications는 관리자만 볼 수 있도록
      };

      // 관리자/운영자/직원인 경우에만 신청서 정보 포함
      if (isAdminUser) {
        programResponse.applications = program.applications || [];
        programResponse.applicationForm = program.applicationForm;
        programResponse.metadata = program.metadata;
      }

      return programResponse;
    });

    // 모집 마감까지 남은 일수 기준으로 정렬 (마감 임박한 것이 위에)
    const sortedPrograms = programsWithStats.sort((a, b) => {
      // 신청 중인 프로그램만 마감일 기준으로 정렬 (기존 상태와 새로운 상태 모두 지원)
      const aIsOpen = a.status === ProgramStatus.APPLICATION_OPEN || a.status === ProgramStatus.OPEN;
      const bIsOpen = b.status === ProgramStatus.APPLICATION_OPEN || b.status === ProgramStatus.OPEN;
      
      if (aIsOpen && bIsOpen) {
        return a.daysUntilDeadline - b.daysUntilDeadline;
      }
      // 신청 중인 프로그램이 우선
      if (aIsOpen && !bIsOpen) return -1;
      if (!aIsOpen && bIsOpen) return 1;
      // 같은 상태면 생성일 기준 내림차순
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return { programs: sortedPrograms, total };
  }

  async findOne(id: string, user: User | null): Promise<Program> {
    // 관리자/운영자/직원인지 확인 (신청서 정보 포함 여부 결정)
    const isAdminUser = user && (user.role === UserRole.ADMIN || user.role === UserRole.OPERATOR || user.role === UserRole.STAFF);

    const relations: string[] = ['organizer'];
    if (isAdminUser) {
      relations.push('applications', 'applications.applicant');
    }

    const program = await this.programRepository.findOne({
      where: { id, isActive: true },
      relations,
    });

    if (!program) {
      throw new NotFoundException('프로그램을 찾을 수 없습니다.');
    }

    // 프로그램 상태를 자동으로 업데이트
    const updatedProgram = await this.updateProgramStatus(program);

    // 관리자는 모든 프로그램 조회 가능, 운영자/직원은 자신의 기관 프로그램만 조회 가능
    if (user && (user.role === UserRole.OPERATOR || user.role === UserRole.STAFF) && user.organizationId) {
      if (updatedProgram.organizerId !== user.organizationId) {
        throw new ForbiddenException('이 프로그램에 접근할 권한이 없습니다.');
      }
    }

    // 응답 객체 생성 (민감한 정보 필터링)
    const programResponse: any = {
      id: updatedProgram.id,
      title: updatedProgram.title,
      summary: updatedProgram.summary,
      description: updatedProgram.description,
      status: updatedProgram.status,
      organizerId: updatedProgram.organizerId,
      organizer: {
        id: updatedProgram.organizer?.id,
        name: updatedProgram.organizer?.name,
        type: updatedProgram.organizer?.type,
        // 주소, 연락처 등 민감한 정보 제외
      },
      applyStart: updatedProgram.applyStart,
      applyEnd: updatedProgram.applyEnd,
      programStart: updatedProgram.programStart,
      programEnd: updatedProgram.programEnd,
      location: updatedProgram.location,
      fee: updatedProgram.fee,
      maxParticipants: updatedProgram.maxParticipants,
      imageUrl: updatedProgram.imageUrl,
      additionalImageUrl: updatedProgram.additionalImageUrl,
      isActive: updatedProgram.isActive,
      createdAt: updatedProgram.createdAt,
      updatedAt: updatedProgram.updatedAt,
    };

    // 관리자/운영자/직원인 경우에만 신청서 정보 포함
    if (isAdminUser) {
      programResponse.applications = updatedProgram.applications || [];
      programResponse.applicationForm = updatedProgram.applicationForm;
      programResponse.metadata = updatedProgram.metadata;
    }

    return programResponse;
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

    // 권한 확인: 관리자, 운영자, 직원만 삭제 가능
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.OPERATOR && user.role !== UserRole.STAFF) {
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
