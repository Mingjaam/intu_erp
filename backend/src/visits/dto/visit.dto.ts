import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject, IsDateString, IsUUID } from 'class-validator';
import { VisitStatus } from '@/database/entities/visit.entity';

export class CreateVisitDto {
  @ApiProperty({ example: 'organization-uuid' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ example: 'program-uuid' })
  @IsUUID()
  programId: string;

  @ApiProperty({ example: '2025-02-15T10:00:00Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ example: '방문 목적 및 내용', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: { purpose: '사업 진행 상황 점검' }, required: false })
  @IsObject()
  @IsOptional()
  outcome?: Record<string, any>;
}

export class UpdateVisitDto {
  @ApiProperty({ example: '2025-02-15T10:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiProperty({ example: '2025-02-15T11:30:00Z', required: false })
  @IsDateString()
  @IsOptional()
  performedAt?: string;

  @ApiProperty({ example: '방문 목적 및 내용', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: { purpose: '사업 진행 상황 점검', result: '양호' }, required: false })
  @IsObject()
  @IsOptional()
  outcome?: Record<string, any>;

  @ApiProperty({ example: 'scheduled', enum: VisitStatus, required: false })
  @IsEnum(VisitStatus)
  @IsOptional()
  status?: VisitStatus;

  @ApiProperty({ example: '후속 조치 사항', required: false })
  @IsString()
  @IsOptional()
  followUpNotes?: string;
}

export class VisitQueryDto {
  @ApiProperty({ example: 'organization-uuid', required: false })
  @IsUUID()
  @IsOptional()
  organizationId?: string;

  @ApiProperty({ example: 'program-uuid', required: false })
  @IsUUID()
  @IsOptional()
  programId?: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  @IsUUID()
  @IsOptional()
  visitorId?: string;

  @ApiProperty({ example: 'scheduled', enum: VisitStatus, required: false })
  @IsEnum(VisitStatus)
  @IsOptional()
  status?: VisitStatus;

  @ApiProperty({ example: '2025-02-01', required: false })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: '2025-02-28', required: false })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  limit?: number;
}
