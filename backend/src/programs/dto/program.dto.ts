import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsObject, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { ProgramStatus } from '@/database/entities/program.entity';

export class CreateProgramDto {
  @ApiProperty({ example: '마을 환경 개선 프로젝트' })
  @IsString()
  title: string;

  @ApiProperty({ example: '마을의 환경을 개선하고 주민들의 삶의 질을 향상시키는 프로젝트입니다.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '환경 개선을 통한 마을 발전 프로젝트', required: false })
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiProperty({ example: 'village-uuid' })
  @IsString()
  organizerId: string;

  @ApiProperty({ example: 'open', enum: ProgramStatus })
  @IsEnum(ProgramStatus)
  status: ProgramStatus;

  @ApiProperty({ example: 50 })
  @IsNumber()
  maxParticipants: number;

  @ApiProperty({ example: '2025-01-01T00:00:00Z' })
  @IsDateString()
  applyStart: string;

  @ApiProperty({ example: '2025-01-31T23:59:59Z' })
  @IsDateString()
  applyEnd: string;

  @ApiProperty({ example: '2025-02-01T00:00:00Z' })
  @IsDateString()
  programStart: string;

  @ApiProperty({ example: '2025-02-28T23:59:59Z' })
  @IsDateString()
  programEnd: string;

  @ApiProperty({ example: '마을회관 2층' })
  @IsString()
  location: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  fee: number;

  @ApiProperty({ example: { fields: [{ name: 'name', type: 'text', label: '이름', required: true }] }, required: false })
  @IsObject()
  @IsOptional()
  applicationForm?: Record<string, any>;

  @ApiProperty({ example: { maxParticipants: 100 }, required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ example: '/uploads/images/program-image.jpg', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: ['/uploads/images/program-image1.jpg', '/uploads/images/program-image2.jpg'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];
}

export class UpdateProgramDto {
  @ApiProperty({ example: '마을 환경 개선 프로젝트', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ example: '마을의 환경을 개선하고 주민들의 삶의 질을 향상시키는 프로젝트입니다.', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '환경 개선을 통한 마을 발전 프로젝트', required: false })
  @IsString()
  @IsOptional()
  summary?: string;

  // organizerId는 업데이트에서 제외 (보안상의 이유)

  @ApiProperty({ example: 'open', enum: ProgramStatus, required: false })
  @IsEnum(ProgramStatus)
  @IsOptional()
  status?: ProgramStatus;

  @ApiProperty({ example: 50, required: false })
  @IsNumber()
  @IsOptional()
  maxParticipants?: number;

  @ApiProperty({ example: '2025-01-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  applyStart?: string;

  @ApiProperty({ example: '2025-01-31T23:59:59Z', required: false })
  @IsDateString()
  @IsOptional()
  applyEnd?: string;

  @ApiProperty({ example: '2025-02-01T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  programStart?: string;

  @ApiProperty({ example: '2025-02-28T23:59:59Z', required: false })
  @IsDateString()
  @IsOptional()
  programEnd?: string;

  @ApiProperty({ example: '마을회관 2층', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 50000, required: false })
  @IsNumber()
  @IsOptional()
  fee?: number;

  @ApiProperty({ example: { fields: [{ name: 'name', type: 'text', label: '이름', required: true }] }, required: false })
  @IsObject()
  @IsOptional()
  applicationForm?: Record<string, any>;

  @ApiProperty({ example: { maxParticipants: 100 }, required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({ example: '/uploads/images/program-image.jpg', required: false })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({ example: ['/uploads/images/program-image1.jpg', '/uploads/images/program-image2.jpg'], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageUrls?: string[];

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ProgramQueryDto {
  @ApiProperty({ example: 'open', enum: ProgramStatus, required: false })
  @IsEnum(ProgramStatus)
  @IsOptional()
  status?: ProgramStatus;

  @ApiProperty({ example: 'village-uuid', required: false })
  @IsString()
  @IsOptional()
  organizerId?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  limit?: number;
}
