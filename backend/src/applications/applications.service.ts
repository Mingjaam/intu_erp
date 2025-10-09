import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from '@/database/entities/application.entity';
import { Program } from '@/database/entities/program.entity';
import { User, UserRole } from '@/database/entities/user.entity';
import { CreateApplicationDto, UpdateApplicationDto, ApplicationQueryDto } from './dto/application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createApplicationDto: CreateApplicationDto, user: User): Promise<Application> {
    const { programId, payload } = createApplicationDto;

    // 프로그램 존재 확인
    const program = await this.programRepository.findOne({
      where: { id: programId, isActive: true },
    });

    if (!program) {
      throw new NotFoundException('프로그램을 찾을 수 없습니다.');
    }

    // 프로그램이 모집 중인지 확인
    if (program.status !== 'open') {
      throw new ForbiddenException('현재 모집 중이 아닌 프로그램입니다.');
    }

    // 신청 기간 확인
    const now = new Date();
    if (now < program.applyStart || now > program.applyEnd) {
      throw new ForbiddenException('신청 기간이 아닙니다.');
    }

    // 중복 신청 확인
    const existingApplication = await this.applicationRepository.findOne({
      where: { programId, applicantId: user.id },
    });

    if (existingApplication) {
      throw new ConflictException('이미 신청한 프로그램입니다.');
    }

    // 사용자 정보를 payload에 자동 추가
    const enrichedPayload = {
      ...payload,
      applicantInfo: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        organizationId: user.organizationId,
      },
    };

    const application = this.applicationRepository.create({
      programId,
      applicantId: user.id,
      payload: enrichedPayload,
      status: ApplicationStatus.SUBMITTED,
    });

    return await this.applicationRepository.save(application);
  }

  async findAll(query: ApplicationQueryDto, user: User): Promise<{ applications: Application[]; total: number }> {
    const { programId, applicantId, status, organizerId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.program', 'program')
      .leftJoinAndSelect('program.organizer', 'organizer')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .leftJoinAndSelect('applicant.organization', 'organization')
      .leftJoinAndSelect('application.selection', 'selection')
      .leftJoin('user_reports', 'report', 'report.reportedUserId = applicant.id')
      .addSelect('COUNT(DISTINCT report.id)', 'applicantReportCount')
      .groupBy('application.id, program.id, organizer.id, applicant.id, organization.id, selection.id, program.title, program.description, program.summary, program.organizerId, program.status, program.applyStart, program.applyEnd, program.programStart, program.programEnd, program.location, program.fee, program.maxParticipants, program.applicationForm, program.metadata, program.imageUrl, program.isActive, program.createdAt, program.updatedAt, organizer.name, organizer.type, organizer.address, organizer.contact, organizer.description, organizer.isActive, organizer.createdAt, organizer.updatedAt, applicant.email, applicant.passwordHash, applicant.name, applicant.role, applicant.organizationId, applicant.phone, applicant.isActive, applicant.lastLoginAt, applicant.memo, applicant.createdAt, applicant.updatedAt, organization.name, organization.type, organization.address, organization.contact, organization.description, organization.isActive, organization.createdAt, organization.updatedAt, selection.applicationId, selection.selected, selection.reason, selection.reviewerId, selection.reviewedAt, selection.criteria, selection.createdAt, selection.updatedAt');

    // 일반 사용자는 자신의 신청서만 조회 가능
    if (user.role === UserRole.APPLICANT) {
      queryBuilder.andWhere('application.applicantId = :applicantId', { applicantId: user.id });
    }

    // 관리자는 모든 프로그램 신청서 조회 가능, 운영자/직원은 자신의 기관 프로그램 신청서만 조회 가능
    if ((user.role === UserRole.OPERATOR || user.role === UserRole.STAFF) && user.organizationId) {
      queryBuilder.andWhere('program.organizerId = :organizationId', { organizationId: user.organizationId });
    }

    if (programId) {
      queryBuilder.andWhere('application.programId = :programId', { programId });
    }

    if (applicantId) {
      queryBuilder.andWhere('application.applicantId = :applicantId', { applicantId });
    }

    if (status) {
      queryBuilder.andWhere('application.status = :status', { status });
    }

    const { entities: applications, raw: rawData } = await queryBuilder
      .orderBy('application.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getRawAndEntities();

    // 총 개수를 별도로 조회
    const totalQuery = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.program', 'program')
      .leftJoin('application.applicant', 'applicant');

    if (user.role === UserRole.APPLICANT) {
      totalQuery.andWhere('application.applicantId = :applicantId', { applicantId: user.id });
    }

    if (organizerId) {
      totalQuery.andWhere('program.organizerId = :organizerId', { organizerId });
    }

    if (programId) {
      totalQuery.andWhere('application.programId = :programId', { programId });
    }

    if (applicantId) {
      totalQuery.andWhere('application.applicantId = :applicantId', { applicantId });
    }

    if (status) {
      totalQuery.andWhere('application.status = :status', { status });
    }

    const total = await totalQuery.getCount();

    // 신고 횟수를 포함한 응답 생성
    const applicationsWithReportCount = applications.map((app, index) => {
      const appWithCount = app as any;
      if (appWithCount.applicant && rawData[index] && rawData[index].applicantReportCount) {
        appWithCount.applicant.reportCount = parseInt(rawData[index].applicantReportCount) || 0;
      }
      return appWithCount;
    });

    return { applications: applicationsWithReportCount, total };
  }

  async findOne(id: string, user: User): Promise<Application> {
    const application = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.program', 'program')
      .leftJoinAndSelect('program.organizer', 'organizer')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .leftJoinAndSelect('applicant.organization', 'organization')
      .leftJoinAndSelect('application.selection', 'selection')
      .leftJoinAndSelect('selection.reviewer', 'reviewer')
      .where('application.id = :id', { id })
      .getOne();

    if (!application) {
      throw new NotFoundException('신청서를 찾을 수 없습니다.');
    }

    // 권한 확인: 신청자 본인 또는 관리자/운영자/직원만 조회 가능
    if (
      user.role === UserRole.APPLICANT &&
      application.applicantId !== user.id
    ) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return application;
  }

  async update(id: string, updateApplicationDto: UpdateApplicationDto, user: User): Promise<Application> {
    const application = await this.findOne(id, user);

    // 권한 확인: 신청자 본인은 제출 전에만 수정 가능, 관리자/운영자/심사자는 언제든 수정 가능
    if (user.role === UserRole.APPLICANT) {
      if (application.applicantId !== user.id) {
        throw new ForbiddenException('수정 권한이 없습니다.');
      }
      if (application.status !== ApplicationStatus.SUBMITTED) {
        throw new ForbiddenException('제출된 신청서는 수정할 수 없습니다.');
      }
    }

    Object.assign(application, updateApplicationDto);
    return await this.applicationRepository.save(application);
  }

  async withdraw(id: string, user: User): Promise<Application> {
    const application = await this.findOne(id, user);

    // 신청자 본인만 철회 가능
    if (user.role === UserRole.APPLICANT && application.applicantId !== user.id) {
      throw new ForbiddenException('철회 권한이 없습니다.');
    }

    // 이미 처리된 신청서는 철회 불가
    if (application.status === ApplicationStatus.SELECTED || application.status === ApplicationStatus.REJECTED) {
      throw new ForbiddenException('이미 처리된 신청서는 철회할 수 없습니다.');
    }

    application.status = ApplicationStatus.WITHDRAWN;
    return await this.applicationRepository.save(application);
  }

  async getApplicationStats(programId: string, user: User): Promise<any> {
    // 프로그램 존재 확인
    const program = await this.programRepository.findOne({
      where: { id: programId, isActive: true },
    });

    if (!program) {
      throw new NotFoundException('프로그램을 찾을 수 없습니다.');
    }

    // 권한 확인
    if (user.role === UserRole.APPLICANT) {
      throw new ForbiddenException('통계 조회 권한이 없습니다.');
    }

    const stats = await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.selection', 'selection')
      .where('application.programId = :programId', { programId })
      .select([
        'COUNT(application.id) as totalApplications',
        'COUNT(CASE WHEN application.status = :submitted THEN 1 END) as submittedCount',
        'COUNT(CASE WHEN application.status = :underReview THEN 1 END) as underReviewCount',
        'COUNT(CASE WHEN application.status = :selected THEN 1 END) as selectedCount',
        'COUNT(CASE WHEN application.status = :rejected THEN 1 END) as rejectedCount',
        'COUNT(CASE WHEN application.status = :withdrawn THEN 1 END) as withdrawnCount',
        'COUNT(CASE WHEN selection.selected = true THEN 1 END) as finalSelectedCount',
      ])
      .setParameters({
        submitted: ApplicationStatus.SUBMITTED,
        underReview: ApplicationStatus.UNDER_REVIEW,
        selected: ApplicationStatus.SELECTED,
        rejected: ApplicationStatus.REJECTED,
        withdrawn: ApplicationStatus.WITHDRAWN,
      })
      .getRawOne();

    return {
      programId,
      programTitle: program.title,
      ...stats,
    };
  }

  async reviewApplication(id: string, decision: 'selected' | 'rejected', user: User): Promise<Application> {
    const application = await this.findOne(id, user);

    // 권한 확인: 관리자/운영자만 심사 가능
    if (user.role === UserRole.APPLICANT) {
      throw new ForbiddenException('심사 권한이 없습니다.');
    }

    // 이미 처리된 신청서는 재심사 불가
    if (application.status === ApplicationStatus.SELECTED || application.status === ApplicationStatus.REJECTED) {
      throw new ConflictException('이미 처리된 신청서입니다.');
    }

    // 심사 상태 업데이트
    application.status = decision === 'selected' ? ApplicationStatus.SELECTED : ApplicationStatus.REJECTED;
    
    return await this.applicationRepository.save(application);
  }

  async updatePaymentStatus(id: string, isPaymentReceived: boolean, user: User): Promise<Application> {
    const application = await this.findOne(id, user);

    // 권한 확인: 관리자/운영자만 입금 상태 변경 가능
    if (user.role === UserRole.APPLICANT) {
      throw new ForbiddenException('입금 상태 변경 권한이 없습니다.');
    }

    // 합격된 신청서만 입금 처리 가능
    if (application.status !== ApplicationStatus.SELECTED) {
      throw new ForbiddenException('합격된 신청서만 입금 처리가 가능합니다.');
    }

    const previousPaymentStatus = application.isPaymentReceived;
    application.isPaymentReceived = isPaymentReceived;
    
    if (isPaymentReceived && !previousPaymentStatus) {
      application.paymentReceivedAt = new Date();
      
      // 프로그램 매출 업데이트
      const program = await this.programRepository.findOne({
        where: { id: application.programId },
      });
      
      if (program) {
        program.revenue += program.fee;
        await this.programRepository.save(program);
      }
    } else if (!isPaymentReceived && previousPaymentStatus) {
      // 입금 취소 시 매출에서 차감
      const program = await this.programRepository.findOne({
        where: { id: application.programId },
      });
      
      if (program) {
        program.revenue = Math.max(0, program.revenue - program.fee);
        await this.programRepository.save(program);
      }
      
      application.paymentReceivedAt = null;
    }

    return await this.applicationRepository.save(application);
  }
}
