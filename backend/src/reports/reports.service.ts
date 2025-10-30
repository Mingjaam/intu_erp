import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { Program } from '../database/entities/program.entity';
import { Selection } from '../database/entities/selection.entity';
import { UserRole } from '../database/entities/user.entity';
import { ParticipantReportQueryDto, ParticipantReportItemDto, ParticipantReportResponseDto, StaffReportItemDto, StaffReportResponseDto } from './dto/participant-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(Selection)
    private selectionRepository: Repository<Selection>,
  ) {}

  async getParticipantReport(
    query: ParticipantReportQueryDto,
    user: any
  ): Promise<ParticipantReportResponseDto> {
    const { year, month, organizationId } = query;
    
    // 날짜 범위 설정 - 해당 월의 시작일과 마지막일
    const targetYear = parseInt(year || new Date().getFullYear().toString());
    const targetMonth = parseInt(month || '1');
    
    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59); // 해당 월의 마지막 날

    console.log('참여자 현황 조회 조건:', {
      year: targetYear,
      month: targetMonth,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      userRole: user.role,
      userOrgId: user.organizationId,
      queryOrgId: organizationId
    });

    // QueryBuilder를 사용하여 복잡한 조인과 조건 처리
    const queryBuilder = this.applicationRepository
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.program', 'program')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .leftJoinAndSelect('application.selection', 'selection')
      .where('program.isActive = :isActive', { isActive: true })
      .andWhere(
        // 프로그램이 해당 월에 시작되거나 진행되는 경우
        '(program.programStart >= :startDate AND program.programStart <= :endDate)',
        { startDate, endDate }
      )
      .andWhere(
        // 선정된 신청만 조회
        '(application.status = :selectedStatus OR (selection.id IS NOT NULL AND selection.selected = :selected))',
        { selectedStatus: 'selected', selected: true }
      );

    // 직원/운영자는 자신의 조직만 볼 수 있음
    if (user.role === UserRole.STAFF || user.role === UserRole.OPERATOR) {
      if (user.organizationId) {
        queryBuilder.andWhere('program.organizerId = :userOrganizationId', { 
          userOrganizationId: user.organizationId 
        });
      }
    }

    // 특정 조직 필터
    if (organizationId) {
      queryBuilder.andWhere('program.organizerId = :organizationId', { organizationId });
    }

    // 정렬 및 조회
    queryBuilder
      .orderBy('program.programStart', 'ASC')
      .addOrderBy('applicant.name', 'ASC');

    const applications = await queryBuilder.getMany();

    console.log(`조회된 신청 수: ${applications.length}`);
    console.log('신청 상태별 분포:', applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {}));

    // 데이터 변환
    const reportData: ParticipantReportItemDto[] = applications.map((app, index) => {
      const program = app.program;
      const applicant = app.applicant;
      
      // payload에서 추가 정보 추출
      const payload = app.payload || {};
      
      // 사용자 엔티티의 필드와 payload 모두 확인 (payload가 우선)
      const gender = payload.gender || applicant.gender || '';
      const birthYear = payload.birthYear || applicant.birthYear || '';
      const hometown = payload.hometown || applicant.hometown || '';
      const residence = payload.residence || applicant.residence || '';
      
      // 성별 한글 변환
      const genderLabel = gender === 'male' ? '남' : gender === 'female' ? '여' : '';
      
      return {
        연번: index + 1,
        프로그램명: program.title,
        운영기간: `${this.formatDate(program.programStart)} ~ ${this.formatDate(program.programEnd)}`,
        성명: applicant.name,
        성별: genderLabel,
        출생년도: birthYear ? birthYear.toString() : '',
        출신지역: hometown,
        참여전거주지: residence
      };
    });

    return {
      data: reportData,
      total: reportData.length,
      year: year || new Date().getFullYear().toString(),
      month: month || new Date().getMonth().toString()
    };
  }

  async exportParticipantReportToExcel(
    query: ParticipantReportQueryDto,
    user: any
  ): Promise<Buffer> {
    const reportData = await this.getParticipantReport(query, user);
    
    // 워크시트 데이터 생성
    const worksheetData = [
      ['연번', '프로그램명', '운영기간', '성명', '성별', '출생년도', '출신지역', '참여전거주지'],
      ...reportData.data.map(item => [
        item.연번,
        item.프로그램명,
        item.운영기간,
        item.성명,
        item.성별 || '',
        item.출생년도 || '',
        item.출신지역 || '',
        item.참여전거주지 || ''
      ])
    ];

    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // 컬럼 너비 설정
    const colWidths = [
      { wch: 8 },   // 연번
      { wch: 30 },  // 프로그램명
      { wch: 25 },  // 운영기간
      { wch: 15 },  // 성명
      { wch: 8 },   // 성별
      { wch: 12 },  // 출생년도
      { wch: 15 },  // 출신지역
      { wch: 20 }   // 참여전거주지
    ];
    worksheet['!cols'] = colWidths;

    // 워크시트 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, '참여자현황');

    // 버퍼로 변환
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  async getStaffReport(
    query: ParticipantReportQueryDto,
    user: any
  ): Promise<StaffReportResponseDto> {
    console.log('사업참여인력 현황 조회 조건:', {
      userRole: user.role,
      userOrgId: user.organizationId
    });

    // 사용자 테이블에서 직원 데이터 조회 (role이 admin, operator, staff인 사용자들)
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.role IN (:...roles)', { roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF] })
      .andWhere('user.isActive = :isActive', { isActive: true });

    // 관리자는 모든 조직, 직원/운영자는 자신의 조직만 볼 수 있음
    if (user.role === UserRole.STAFF || user.role === UserRole.OPERATOR) {
      if (user.organizationId) {
        queryBuilder.andWhere('user.organizationId = :userOrganizationId', { 
          userOrganizationId: user.organizationId 
        });
      }
    }

    // 정렬 및 조회
    queryBuilder
      .orderBy('user.createdAt', 'ASC')
      .addOrderBy('user.name', 'ASC');

    const staffUsers = await queryBuilder.getMany();

    console.log(`조회된 직원 수: ${staffUsers.length}`);

    // 데이터 변환
    const reportData: StaffReportItemDto[] = staffUsers.map((user, index) => {
      return {
        연번: index + 1,
        계약형태: user.contractType || '정규직', // 사용자 정보에서 가져오거나 기본값
        직책: user.position || '직원', // 사용자 정보에서 가져오거나 기본값
        성명: user.name,
        입사일: user.hireDate ? this.formatDate(new Date(user.hireDate)) : this.formatDate(user.createdAt),
        퇴사일: user.resignationDate ? this.formatDate(new Date(user.resignationDate)) : (user.isActive ? '-' : this.formatDate(user.updatedAt)),
        참여율: '', // 빈칸으로 설정
      };
    });

    return {
      data: reportData,
      total: reportData.length,
      year: new Date().getFullYear().toString(),
      month: (new Date().getMonth() + 1).toString()
    };
  }

  async exportStaffReportToExcel(
    query: ParticipantReportQueryDto,
    user: any
  ): Promise<Buffer> {
    const reportData = await this.getStaffReport(query, user);

    const worksheetData = [
      ['연번', '계약형태', '직책', '성명', '입사일', '퇴사일', '참여율'],
      ...reportData.data.map(item => [
        item.연번,
        item.계약형태,
        item.직책,
        item.성명,
        item.입사일,
        item.퇴사일,
        item.참여율
      ])
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    const colWidths = [
      { wch: 8 },   // 연번
      { wch: 12 },  // 계약형태
      { wch: 15 },  // 직책
      { wch: 15 },  // 성명
      { wch: 15 },  // 입사일
      { wch: 15 },  // 퇴사일
      { wch: 10 }   // 참여율
    ];
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, '사업참여인력현황');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  private formatDate(date: Date): string {
    // 한국 시간대로 정확히 변환
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Seoul'
    }).format(new Date(date));
  }
}
