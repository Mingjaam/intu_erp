import { IsOptional, IsString, IsDateString } from 'class-validator';

export class ParticipantReportQueryDto {
  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  month?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class ParticipantReportItemDto {
  연번: number;
  프로그램명: string;
  운영기간: string;
  성명: string;
  성별: string;
  출생년도: string;
  출신지역: string;
  참여전거주지: string;
}

export class ParticipantReportResponseDto {
  data: ParticipantReportItemDto[];
  total: number;
  year: string;
  month: string;
}

export class StaffReportItemDto {
  연번: number;
  계약형태: string;
  직책: string;
  성명: string;
  입사일: string;
  퇴사일: string;
  참여율: string;
}

export class StaffReportResponseDto {
  data: StaffReportItemDto[];
  total: number;
  year: string;
  month: string;
}
