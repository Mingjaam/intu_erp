import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ApiResponseDto<T = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ required: false })
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };

  @ApiProperty({ required: false })
  message?: string;

  constructor(data: T, success = true, message?: string, meta?: any) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.meta = meta;
  }
}

export class PaginationDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
