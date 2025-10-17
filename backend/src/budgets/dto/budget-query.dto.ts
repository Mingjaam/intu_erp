import { IsOptional, IsNumber, IsUUID, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class BudgetQueryDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(2020)
  @Max(2030)
  year?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(12)
  month?: number;
}
