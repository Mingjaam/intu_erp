import { ApiProperty } from '@nestjs/swagger';

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
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  limit?: number = 10;

  @ApiProperty({ required: false })
  search?: string;

  @ApiProperty({ required: false })
  sortBy?: string;

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'], default: 'DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
