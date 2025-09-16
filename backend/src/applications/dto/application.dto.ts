import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsObject, IsNumber, IsUUID } from 'class-validator';
import { ApplicationStatus } from '@/database/entities/application.entity';

export class CreateApplicationDto {
  @ApiProperty({ example: 'program-uuid' })
  @IsUUID()
  programId: string;

  @ApiProperty({ example: { name: '홍길동', phone: '010-1234-5678', address: '서울시 강남구' } })
  @IsObject()
  payload: Record<string, any>;
}

export class UpdateApplicationDto {
  @ApiProperty({ example: { name: '홍길동', phone: '010-1234-5678', address: '서울시 강남구' }, required: false })
  @IsObject()
  @IsOptional()
  payload?: Record<string, any>;

  @ApiProperty({ example: 'submitted', enum: ApplicationStatus, required: false })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @ApiProperty({ example: 85.5, required: false })
  @IsNumber()
  @IsOptional()
  score?: number;

  @ApiProperty({ example: '우수한 신청서입니다.', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ApplicationQueryDto {
  @ApiProperty({ example: 'program-uuid', required: false })
  @IsUUID()
  @IsOptional()
  programId?: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  @IsUUID()
  @IsOptional()
  applicantId?: string;

  @ApiProperty({ example: 'submitted', enum: ApplicationStatus, required: false })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  limit?: number;
}
