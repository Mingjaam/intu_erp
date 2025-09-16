import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsObject, IsUUID } from 'class-validator';

export class CreateSelectionDto {
  @ApiProperty({ example: 'application-uuid' })
  @IsUUID()
  applicationId: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  selected: boolean;

  @ApiProperty({ example: '우수한 신청서로 선정되었습니다.', required: false })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ example: { score: 85, criteria: ['창의성', '실현가능성'] }, required: false })
  @IsObject()
  @IsOptional()
  criteria?: Record<string, any>;
}

export class UpdateSelectionDto {
  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  selected?: boolean;

  @ApiProperty({ example: '우수한 신청서로 선정되었습니다.', required: false })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ example: { score: 85, criteria: ['창의성', '실현가능성'] }, required: false })
  @IsObject()
  @IsOptional()
  criteria?: Record<string, any>;
}

export class SelectionQueryDto {
  @ApiProperty({ example: 'program-uuid', required: false })
  @IsUUID()
  @IsOptional()
  programId?: string;

  @ApiProperty({ example: 'user-uuid', required: false })
  @IsUUID()
  @IsOptional()
  reviewerId?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  selected?: boolean;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  limit?: number;
}
