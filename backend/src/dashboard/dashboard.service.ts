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
import { ExcelService } from '@/common/services/excel.service';

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
    private excelService: ExcelService,
  ) {}

  async getDashboardStats(query?: DashboardQueryDto, user?: User) {
    const dateFilter = this.getDateFilter(query);
    const organizationId = user?.organizationId;
    
    const [
      totalUsers,
      totalPrograms,
      activePrograms,
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
      this.getUserCount(organizationId),
      this.getProgramCount(organizationId),
      this.getActiveProgramCount(organizationId),
      this.getApplicationCount(organizationId),
      this.getSelectionCount(organizationId),
      this.getVisitCount(organizationId),
      this.organizationRepository.count(),
      this.getRecentApplications(5, organizationId),
      this.getRecentPrograms(5, organizationId),
      this.getRecentVisits(5, organizationId),
      this.getProgramStats(organizationId),
      this.getUserRoleStats(organizationId),
      this.getOrganizationTypeStats(),
      this.getMonthlyStats(dateFilter, organizationId),
      this.getApplicationTrends(dateFilter, organizationId),
      this.getProgramStatusStats(organizationId),
    ]);

    // 매출 계산 (선정된 신청자 * 프로그램 수수료)
    const totalRevenue = await this.calculateTotalRevenue(organizationId);

    return {
      overview: {
        totalUsers,
        totalPrograms,
        activePrograms,
        totalApplications,
        totalSelections,
        totalVisits,
        totalOrganizations,
        totalRevenue,
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

  private async getUserCount(organizationId?: string) {
    if (!organizationId) return this.userRepository.count();
    return this.userRepository.count({ where: { organizationId } });
  }

  private async getProgramCount(organizationId?: string) {
    if (!organizationId) return this.programRepository.count();
    return this.programRepository.count({ where: { organizerId: organizationId } });
  }

  private async getActiveProgramCount(organizationId?: string) {
    if (!organizationId) {
      return this.programRepository.count({ where: { status: ProgramStatus.OPEN } });
    }
    return this.programRepository.count({ 
      where: { 
        organizerId: organizationId,
        status: ProgramStatus.OPEN 
      } 
    });
  }

  private async getApplicationCount(organizationId?: string) {
    if (!organizationId) return this.applicationRepository.count();
    
    return this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.program', 'program')
      .where('program.organizerId = :organizationId', { organizationId })
      .getCount();
  }

  private async getSelectionCount(organizationId?: string) {
    if (!organizationId) return this.selectionRepository.count();
    
    return this.selectionRepository
      .createQueryBuilder('selection')
      .leftJoin('selection.application', 'application')
      .leftJoin('application.program', 'program')
      .where('program.organizerId = :organizationId', { organizationId })
      .getCount();
  }

  private async getVisitCount(organizationId?: string) {
    if (!organizationId) return this.visitRepository.count();
    
    return this.visitRepository
      .createQueryBuilder('visit')
      .leftJoin('visit.program', 'program')
      .where('program.organizerId = :organizationId', { organizationId })
      .getCount();
  }

  private async getRecentApplications(limit = 5, organizationId?: string) {
    if (!organizationId) {
      return this.applicationRepository.find({
        relations: ['program', 'applicant'],
        order: { createdAt: 'DESC' },
        take: limit,
      });
    }

    return this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.program', 'program')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .where('program.organizerId = :organizationId', { organizationId })
      .orderBy('application.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  private async getRecentPrograms(limit = 5, organizationId?: string) {
    let programs;
    
    if (!organizationId) {
      programs = await this.programRepository.find({
        where: { isActive: true },
        relations: ['organizer', 'applications'],
        order: { createdAt: 'DESC' },
        take: limit,
      });
    } else {
      programs = await this.programRepository.find({
        where: { organizerId: organizationId, isActive: true },
        relations: ['organizer', 'applications'],
        order: { createdAt: 'DESC' },
        take: limit,
      });
    }

    return programs.map(program => ({
      id: program.id,
      title: program.title,
      status: program.status,
      applicationCount: program.applications.length,
      maxParticipants: program.maxParticipants,
      fee: program.fee,
      createdAt: program.createdAt,
      organizer: program.organizer,
      applyStart: program.applyStart,
      applyEnd: program.applyEnd,
      programStart: program.programStart,
      programEnd: program.programEnd,
    }));
  }

  private async getRecentVisits(limit = 5, organizationId?: string) {
    if (!organizationId) {
      return this.visitRepository.find({
        relations: ['program', 'organization', 'visitor'],
        order: { createdAt: 'DESC' },
        take: limit,
      });
    }

    return this.visitRepository
      .createQueryBuilder('visit')
      .leftJoinAndSelect('visit.program', 'program')
      .leftJoinAndSelect('visit.organization', 'organization')
      .leftJoinAndSelect('visit.visitor', 'visitor')
      .where('program.organizerId = :organizationId', { organizationId })
      .orderBy('visit.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  private async getProgramStats(organizationId?: string) {
    let programs;
    
    if (organizationId) {
      programs = await this.programRepository.find({
        where: { organizerId: organizationId },
        relations: ['applications', 'applications.selection'],
      });
    } else {
      programs = await this.programRepository.find({
        relations: ['applications', 'applications.selection'],
      });
    }

    return programs.map(program => {
      const selectedCount = program.applications.filter(app => 
        app.selection && app.selection.selected
      ).length;
      
      return {
        id: program.id,
        title: program.title,
        status: program.status,
        applicationCount: program.applications.length,
        selectedCount,
        fee: program.fee,
        revenue: selectedCount * program.fee,
        maxParticipants: program.maxParticipants,
        createdAt: program.createdAt,
      };
    });
  }

  private async getUserRoleStats(organizationId?: string) {
    let query = this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role');

    if (organizationId) {
      query = query.where('user.organizationId = :organizationId', { organizationId });
    }

    const result = await query.getRawMany();

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

  private async getMonthlyStats(dateFilter: any, organizationId?: string) {
    let query = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.program', 'program')
       .select('DATE_TRUNC(\'month\', application.createdAt)', 'month')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE_TRUNC(\'month\', application.createdAt)')
      .orderBy('month', 'ASC');

    if (organizationId) {
      query = query.where('program.organizerId = :organizationId', { organizationId });
    }

    if (dateFilter) {
      query = query.andWhere('application.createdAt BETWEEN :startDate AND :endDate', {
        startDate: dateFilter._value1,
        endDate: dateFilter._value2,
      });
    }

    const result = await query.getRawMany();

    return result.map(item => ({
      month: item.month,
      count: parseInt(item.count),
    }));
  }

  private async getApplicationTrends(dateFilter: any, organizationId?: string) {
    let query = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.program', 'program')
      .select('DATE_TRUNC(\'day\', application.createdAt)', 'day')
      .addSelect('COUNT(*)', 'count')
      .groupBy('DATE_TRUNC(\'day\', application.createdAt)')
      .orderBy('day', 'ASC')
      .limit(30);

    if (organizationId) {
      query = query.where('program.organizerId = :organizationId', { organizationId });
    }

    if (dateFilter) {
      query = query.andWhere('application.createdAt BETWEEN :startDate AND :endDate', {
        startDate: dateFilter._value1,
        endDate: dateFilter._value2,
      });
    }

    const result = await query.getRawMany();

    return result.map(item => ({
      day: item.day,
      count: parseInt(item.count),
    }));
  }

  private async getProgramStatusStats(organizationId?: string) {
    let query = this.programRepository
      .createQueryBuilder('program')
      .select('program.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('program.status');

    if (organizationId) {
      query = query.where('program.organizerId = :organizationId', { organizationId });
    }

    const result = await query.getRawMany();

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

  private async calculateTotalRevenue(organizationId?: string): Promise<number> {
    let query = this.selectionRepository
      .createQueryBuilder('selection')
      .leftJoin('selection.application', 'application')
      .leftJoin('application.program', 'program')
      .where('selection.selected = :selected', { selected: true })
      .select('SUM(program.fee)', 'totalRevenue');

    if (organizationId) {
      query = query.andWhere('program.organizerId = :organizationId', { organizationId });
    }

    const result = await query.getRawOne();
    return parseInt(result.totalRevenue) || 0;
  }

  private calculateHealthScore(users: number, programs: number, applications: number, activePrograms: number) {
    if (users === 0) return 0;
    
    const programUtilization = activePrograms / Math.max(programs, 1);
    const applicationRate = applications / Math.max(users, 1);
    
    return Math.min(100, Math.round((programUtilization * 50) + (applicationRate * 50)));
  }

  /**
   * 데이터 타입에 따른 엑셀 다운로드
   */
  async exportData(type: string, user?: User) {
    const organizationId = user?.organizationId;

    switch (type) {
      case 'users':
        const users = await this.getUsersForExport(organizationId);
        return this.excelService.exportUsers(users);
      
      case 'programs':
        const programs = await this.getProgramsForExport(organizationId);
        return this.excelService.exportPrograms(programs);
      
      case 'applications':
        const applications = await this.getApplicationsForExport(organizationId);
        return this.excelService.exportApplications(applications);
      
      default:
        throw new Error(`지원하지 않는 데이터 타입입니다: ${type}`);
    }
  }

  private async getUsersForExport(organizationId?: string) {
    if (organizationId) {
      return this.userRepository.find({
        where: { organizationId },
        relations: ['organization'],
        order: { createdAt: 'DESC' },
      });
    }
    
    return this.userRepository.find({
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });
  }

  private async getProgramsForExport(organizationId?: string) {
    if (organizationId) {
      return this.programRepository.find({
        where: { organizerId: organizationId },
        relations: ['organizer', 'applications', 'applications.selection'],
        order: { createdAt: 'DESC' },
      });
    }
    
    return this.programRepository.find({
      relations: ['organizer', 'applications', 'applications.selection'],
      order: { createdAt: 'DESC' },
    });
  }

  private async getApplicationsForExport(organizationId?: string) {
    if (organizationId) {
      return this.applicationRepository
        .createQueryBuilder('application')
        .leftJoinAndSelect('application.program', 'program')
        .leftJoinAndSelect('application.applicant', 'applicant')
        .leftJoinAndSelect('application.selection', 'selection')
        .where('program.organizerId = :organizationId', { organizationId })
        .orderBy('application.createdAt', 'DESC')
        .getMany();
    }
    
    return this.applicationRepository.find({
      relations: ['program', 'applicant', 'selection'],
      order: { createdAt: 'DESC' },
    });
  }
}
