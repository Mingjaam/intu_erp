import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { OrganizationType } from '@/database/entities/organization.entity';

export class CreateOrganizationDto {
  @ApiProperty({ example: '행복마을회' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'village', enum: OrganizationType })
  @IsEnum(OrganizationType)
  type: OrganizationType;

  @ApiProperty({ example: '서울시 강남구 테헤란로 123', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '02-1234-5678', required: false })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiProperty({ example: '지역 주민들의 복지 향상을 위한 마을회', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateOrganizationDto {
  @ApiProperty({ example: '행복마을회', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'village', enum: OrganizationType, required: false })
  @IsEnum(OrganizationType)
  @IsOptional()
  type?: OrganizationType;

  @ApiProperty({ example: '서울시 강남구 테헤란로 123', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '02-1234-5678', required: false })
  @IsString()
  @IsOptional()
  contact?: string;

  @ApiProperty({ example: '지역 주민들의 복지 향상을 위한 마을회', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class OrganizationQueryDto {
  @ApiProperty({ example: 'village', enum: OrganizationType, required: false })
  @IsEnum(OrganizationType)
  @IsOptional()
  type?: OrganizationType;

  @ApiProperty({ example: '행복', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  limit?: number;
}
