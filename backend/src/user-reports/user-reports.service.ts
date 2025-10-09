import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserReport } from '../database/entities/user-report.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { CreateUserReportDto, UserReportResponseDto, UserReportQueryDto } from './dto/user-report.dto';

@Injectable()
export class UserReportsService {
  constructor(
    @InjectRepository(UserReport)
    private userReportRepository: Repository<UserReport>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserReportDto: CreateUserReportDto, reporter: User): Promise<UserReportResponseDto> {
    // 신고당한 사용자 존재 확인
    const reportedUser = await this.userRepository.findOne({
      where: { id: createUserReportDto.reportedUserId },
    });

    if (!reportedUser) {
      throw new NotFoundException('신고할 사용자를 찾을 수 없습니다.');
    }

    // 자기 자신을 신고하는 것 방지
    if (reporter.id === createUserReportDto.reportedUserId) {
      throw new ForbiddenException('자기 자신을 신고할 수 없습니다.');
    }

    const userReport = this.userReportRepository.create({
      ...createUserReportDto,
      reporterId: reporter.id,
    });

    const savedReport = await this.userReportRepository.save(userReport);
    return this.toResponseDto(savedReport);
  }

  async findAll(query: UserReportQueryDto, user: User): Promise<{
    reports: UserReportResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, status, reportedUserId, search } = query;

    const queryBuilder = this.userReportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter')
      .leftJoinAndSelect('reporter.organization', 'reporterOrg')
      .leftJoinAndSelect('report.reportedUser', 'reportedUser')
      .leftJoinAndSelect('report.reviewer', 'reviewer');

    // 일반 사용자는 자신이 신고한 것만 조회 가능
    if (user.role === UserRole.APPLICANT) {
      queryBuilder.andWhere('report.reporterId = :reporterId', { reporterId: user.id });
    }

    // 관리자/운영자/직원은 모든 신고 조회 가능 (마을 구분 없이)
    if (user.role === UserRole.ADMIN || user.role === UserRole.OPERATOR || user.role === UserRole.STAFF) {
      // 모든 마을의 신고를 볼 수 있음
    }

    if (status) {
      queryBuilder.andWhere('report.status = :status', { status });
    }

    if (reportedUserId) {
      queryBuilder.andWhere('report.reportedUserId = :reportedUserId', { reportedUserId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(reporter.name ILIKE :search OR reportedUser.name ILIKE :search OR report.reason ILIKE :search OR report.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [reports, total] = await queryBuilder
      .orderBy('report.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      reports: reports.map(report => this.toResponseDto(report)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user: User): Promise<UserReportResponseDto> {
    const report = await this.userReportRepository.findOne({
      where: { id },
      relations: ['reporter', 'reporter.organization', 'reportedUser', 'reviewer'],
    });

    if (!report) {
      throw new NotFoundException('신고를 찾을 수 없습니다.');
    }

    // 권한 확인
    if (user.role === UserRole.APPLICANT && report.reporterId !== user.id) {
      throw new ForbiddenException('이 신고에 접근할 권한이 없습니다.');
    }

    return this.toResponseDto(report);
  }


  async remove(id: string, user: User): Promise<void> {
    const report = await this.userReportRepository.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException('신고를 찾을 수 없습니다.');
    }

    // 신고자 또는 관리자/운영자만 삭제 가능
    if (user.role === UserRole.APPLICANT && report.reporterId !== user.id) {
      throw new ForbiddenException('이 신고를 삭제할 권한이 없습니다.');
    }

    await this.userReportRepository.softDelete(id);
  }

  private toResponseDto(report: UserReport): UserReportResponseDto {
    return {
      id: report.id,
      reporterId: report.reporterId,
      reportedUserId: report.reportedUserId,
      reason: report.reason,
      description: report.description,
      status: report.status,
      adminNotes: report.adminNotes,
      reviewedBy: report.reviewedBy,
      reviewedAt: report.reviewedAt,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      reporter: report.reporter ? {
        id: report.reporter.id,
        name: report.reporter.name,
        email: report.reporter.email,
        organization: report.reporter.organization ? {
          id: report.reporter.organization.id,
          name: report.reporter.organization.name,
        } : undefined,
      } : undefined,
      reportedUser: report.reportedUser ? {
        id: report.reportedUser.id,
        name: report.reportedUser.name,
        email: report.reportedUser.email,
      } : undefined,
      reviewer: report.reviewer ? {
        id: report.reviewer.id,
        name: report.reviewer.name,
        email: report.reviewer.email,
      } : undefined,
    };
  }
}
