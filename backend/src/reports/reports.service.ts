import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as XLSX from 'xlsx';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { Program } from '../database/entities/program.entity';
import { Selection } from '../database/entities/selection.entity';
import { UserRole } from '../database/entities/user.entity';
import { ParticipantReportQueryDto, ParticipantReportItemDto, ParticipantReportResponseDto } from './dto/participant-report.dto';

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
    
    // 날짜 범위 설정
    const startDate = new Date(parseInt(year || new Date().getFullYear().toString()), 
                              parseInt(month || '1') - 1, 1);
    const endDate = new Date(parseInt(year || new Date().getFullYear().toString()), 
                            parseInt(month || '12'), 31, 23, 59, 59);

    // 권한에 따른 조직 필터링
    let whereCondition: any = {
      program: {
        programStart: Between(startDate, endDate),
        isActive: true
      },
      status: 'selected' // 선정된 신청만
    };

    // 직원/운영자는 자신의 조직만 볼 수 있음
    if (user.role === UserRole.STAFF || user.role === UserRole.OPERATOR) {
      if (user.organizationId) {
        whereCondition.program.organizerId = user.organizationId;
      }
    }

    // 특정 조직 필터
    if (organizationId) {
      whereCondition.program.organizerId = organizationId;
    }

    // 데이터 조회
    const applications = await this.applicationRepository.find({
      where: whereCondition,
      relations: ['program', 'applicant', 'selection'],
      order: {
        program: { programStart: 'ASC' },
        applicant: { name: 'ASC' }
      }
    });

    // 데이터 변환
    const reportData: ParticipantReportItemDto[] = applications.map((app, index) => {
      const program = app.program;
      const applicant = app.applicant;
      
      // payload에서 추가 정보 추출
      const payload = app.payload || {};
      
      return {
        연번: index + 1,
        프로그램명: program.title,
        운영기간: `${this.formatDate(program.programStart)} ~ ${this.formatDate(program.programEnd)}`,
        성명: applicant.name,
        성별: payload.gender || '',
        출생년도: payload.birthYear || '',
        출신지역: payload.birthRegion || '',
        참여전거주지: payload.residence || ''
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

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
}
