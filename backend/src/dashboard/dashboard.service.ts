import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '@/database/entities/user.entity';
import { Program, ProgramStatus } from '@/database/entities/program.entity';
import { Application } from '@/database/entities/application.entity';
import { Selection } from '@/database/entities/selection.entity';
import { Visit } from '@/database/entities/visit.entity';
import { Organization } from '@/database/entities/organization.entity';
import { DashboardQueryDto, DateRange } from './dto/dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Selection)
    private selectionRepository: Repository<Selection>,
    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async getDashboardStats(query?: DashboardQueryDto) {
    const dateFilter = this.getDateFilter(query);
    const [
      totalUsers,
      totalPrograms,
      totalApplications,
      totalSelections,
      totalVisits,
      totalOrganizations,
      recentApplications,
      recentPrograms,
      recentVisits,
      programStats,
      userRoleStats,
      organizationTypeStats,
      monthlyStats,
      applicationTrends,
      programStatusStats,
    ] = await Promise.all([
      this.userRepository.count(),
      this.programRepository.count(),
      this.applicationRepository.count(),
      this.selectionRepository.count(),
      this.visitRepository.count(),
      this.organizationRepository.count(),
      this.getRecentApplications(),
      this.getRecentPrograms(),
      this.getRecentVisits(),
      this.getProgramStats(),
      this.getUserRoleStats(),
      this.getOrganizationTypeStats(),
      this.getMonthlyStats(dateFilter),
      this.getApplicationTrends(dateFilter),
      this.getProgramStatusStats(),
    ]);

    return {
      overview: {
        totalUsers,
        totalPrograms,
        totalApplications,
        totalSelections,
        totalVisits,
        totalOrganizations,
      },
      recent: {
        applications: recentApplications,
        programs: recentPrograms,
        visits: recentVisits,
      },
      charts: {
        programStats,
        userRoleStats,
        organizationTypeStats,
        monthlyStats,
        applicationTrends,
        programStatusStats,
      },
    };
  }

  private async getRecentApplications(limit = 5) {
    return this.applicationRepository.find({
      relations: ['program', 'applicant'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private async getRecentPrograms(limit = 5) {
    return this.programRepository.find({
      relations: ['organizer'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private async getRecentVisits(limit = 5) {
    return this.visitRepository.find({
      relations: ['program', 'organization', 'visitor'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  private async getProgramStats() {
    const programs = await this.programRepository.find({
      relations: ['applications'],
    });

    return programs.map(program => ({
      id: program.id,
      title: program.title,
      status: program.status,
      applicationCount: program.applications.length,
      createdAt: program.createdAt,
    }));
  }

  private async getUserRoleStats() {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    return result.map(item => ({
      role: item.role,
      count: parseInt(item.count),
    }));
  }

  private async getOrganizationTypeStats() {
    const result = await this.organizationRepository
      .createQueryBuilder('organization')
      .select('organization.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('organization.type')
      .getRawMany();

    return result.map(item => ({
      type: item.type,
      count: parseInt(item.count),
    }));
  }

  private getDateFilter(query?: DashboardQueryDto) {
    if (!query) return null;

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);
    } else if (query.dateRange) {
      switch (query.dateRange) {
        case DateRange.TODAY:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case DateRange.WEEK:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case DateRange.MONTH:
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case DateRange.QUARTER:
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case DateRange.YEAR:
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          return null;
      }
    } else {
      return null;
    }

    return Between(startDate, endDate);
  }

  private async getMonthlyStats(dateFilter: any) {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .select('DATE_TRUNC(\'month\', application.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where(dateFilter ? { createdAt: dateFilter } : {})
      .groupBy('DATE_TRUNC(\'month\', application.createdAt)')
      .orderBy('month', 'ASC')
      .getRawMany();

    return result.map(item => ({
      month: item.month,
      count: parseInt(item.count),
    }));
  }

  private async getApplicationTrends(dateFilter: any) {
    const result = await this.applicationRepository
      .createQueryBuilder('application')
      .select('DATE_TRUNC(\'day\', application.createdAt)', 'day')
      .addSelect('COUNT(*)', 'count')
      .where(dateFilter ? { createdAt: dateFilter } : {})
      .groupBy('DATE_TRUNC(\'day\', application.createdAt)')
      .orderBy('day', 'ASC')
      .limit(30)
      .getRawMany();

    return result.map(item => ({
      day: item.day,
      count: parseInt(item.count),
    }));
  }

  private async getProgramStatusStats() {
    const result = await this.programRepository
      .createQueryBuilder('program')
      .select('program.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('program.status')
      .getRawMany();

    return result.map(item => ({
      status: item.status,
      count: parseInt(item.count),
    }));
  }

  async getSystemHealth() {
    const [
      totalUsers,
      totalPrograms,
      totalApplications,
      activePrograms,
      recentErrors,
    ] = await Promise.all([
      this.userRepository.count(),
      this.programRepository.count(),
      this.applicationRepository.count(),
      this.programRepository.count({ where: { status: ProgramStatus.OPEN } }),
      this.getRecentErrors(),
    ]);

    return {
      totalUsers,
      totalPrograms,
      totalApplications,
      activePrograms,
      recentErrors,
      healthScore: this.calculateHealthScore(totalUsers, totalPrograms, totalApplications, activePrograms),
    };
  }

  private async getRecentErrors() {
    // 실제 에러 로그가 있다면 여기서 조회
    // 현재는 빈 배열 반환
    return [];
  }

  private calculateHealthScore(users: number, programs: number, applications: number, activePrograms: number) {
    if (users === 0) return 0;
    
    const programUtilization = activePrograms / Math.max(programs, 1);
    const applicationRate = applications / Math.max(users, 1);
    
    return Math.min(100, Math.round((programUtilization * 50) + (applicationRate * 50)));
  }
}
