import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { Program } from '../../database/entities/program.entity';
import { Application } from '../../database/entities/application.entity';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class ExcelService {
  /**
   * 프로그램 목록을 엑셀로 변환
   */
  exportPrograms(programs: Program[]): Buffer {
    const data = programs.map(program => ({
      '프로그램명': program.title,
      '설명': program.description,
      '상태': this.getStatusLabel(program.status),
      '신청시작일': this.formatDate(program.applyStart),
      '신청마감일': this.formatDate(program.applyEnd),
      '프로그램시작일': this.formatDate(program.programStart),
      '프로그램종료일': this.formatDate(program.programEnd),
      '장소': program.location,
      '참가비': program.fee,
      '최대참가자수': program.maxParticipants,
      '신청자수': program.applications?.length || 0,
      '선정자수': program.applications?.filter(app => app.selection?.selected).length || 0,
      '수익': (program.applications?.filter(app => app.selection?.selected).length || 0) * program.fee,
      '조직명': program.organizer?.name || '',
      '생성일': this.formatDate(program.createdAt),
    }));

    return this.createExcelBuffer(data, '프로그램목록');
  }

  /**
   * 신청서 목록을 엑셀로 변환
   */
  exportApplications(applications: Application[]): Buffer {
    const data = applications.map(application => ({
      '신청서ID': application.id,
      '프로그램명': application.program?.title || '',
      '신청자명': application.applicant?.name || '',
      '신청자이메일': application.applicant?.email || '',
      '신청자전화번호': application.applicant?.phone || '',
      '신청상태': this.getApplicationStatusLabel(application.status),
      '선정여부': application.selection?.selected ? '선정' : '미선정',
      '점수': application.score || '',
      '비고': application.notes || '',
      '결제여부': application.isPaymentReceived ? '결제완료' : '미결제',
      '결제일': application.paymentReceivedAt ? this.formatDate(application.paymentReceivedAt) : '',
      '신청일': this.formatDate(application.createdAt),
    }));

    return this.createExcelBuffer(data, '신청서목록');
  }

  /**
   * 사용자 목록을 엑셀로 변환
   */
  exportUsers(users: User[]): Buffer {
    const data = users.map(user => ({
      '사용자ID': user.id,
      '이름': user.name,
      '이메일': user.email,
      '전화번호': user.phone || '',
      '역할': this.getUserRoleLabel(user.role),
      '조직명': user.organization?.name || '',
      '계정상태': user.isActive ? '활성' : '비활성',
      '마지막로그인': user.lastLoginAt ? this.formatDate(user.lastLoginAt) : '',
      '가입일': this.formatDate(user.createdAt),
    }));

    return this.createExcelBuffer(data, '사용자목록');
  }

  /**
   * 엑셀 버퍼 생성
   */
  private createExcelBuffer(data: any[], sheetName: string): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    
    // 컬럼 너비 자동 조정
    const colWidths = this.calculateColumnWidths(data);
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * 컬럼 너비 계산
   */
  private calculateColumnWidths(data: any[]): any[] {
    if (data.length === 0) return [];
    
    const keys = Object.keys(data[0]);
    return keys.map(key => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
  }

  /**
   * 상태 라벨 변환
   */
  private getStatusLabel(status: string): string {
    const statusLabels = {
      draft: '신청 전',
      open: '모집중',
      closed: '신청마감',
      ongoing: '진행중',
      completed: '완료',
      archived: '보관',
    };
    return statusLabels[status] || status;
  }

  /**
   * 신청서 상태 라벨 변환
   */
  private getApplicationStatusLabel(status: string): string {
    const statusLabels = {
      pending: '대기중',
      approved: '승인',
      rejected: '거절',
      selected: '선정',
      withdrawn: '철회',
    };
    return statusLabels[status] || status;
  }

  /**
   * 사용자 역할 라벨 변환
   */
  private getUserRoleLabel(role: string): string {
    const roleLabels = {
      admin: '관리자',
      operator: '운영자',
      staff: '직원',
      applicant: '신청자',
    };
    return roleLabels[role] || role;
  }

  /**
   * 날짜 포맷팅
   */
  private formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
