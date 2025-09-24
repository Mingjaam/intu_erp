import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';

export enum ReportStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export class CreateUserReportDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsUUID()
  reportedUserId: string;

  @ApiProperty({ example: '스팸 또는 부적절한 행동' })
  @IsString()
  reason: string;

  @ApiProperty({ example: '구체적인 신고 사유를 작성해주세요.', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateUserReportDto {
  @ApiProperty({ enum: ReportStatus, example: ReportStatus.REVIEWED, required: false })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @ApiProperty({ example: '관리자 검토 결과', required: false })
  @IsString()
  @IsOptional()
  adminNotes?: string;
}

export class UserReportResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reporterId: string;

  @ApiProperty()
  reportedUserId: string;

  @ApiProperty()
  reason: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: ReportStatus })
  status: ReportStatus;

  @ApiProperty({ required: false })
  adminNotes?: string;

  @ApiProperty({ required: false })
  reviewedBy?: string;

  @ApiProperty({ required: false })
  reviewedAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Relations
  @ApiProperty({ required: false })
  reporter?: {
    id: string;
    name: string;
    email: string;
    organization?: {
      id: string;
      name: string;
    };
  };

  @ApiProperty({ required: false })
  reportedUser?: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty({ required: false })
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}

export class UserReportQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  limit?: number;

  @ApiProperty({ enum: ReportStatus, required: false })
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  reportedUserId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  search?: string;
}
