import { IsString, IsNumber, IsEnum, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { BudgetCategory } from '../../database/entities/budget.entity';

export class CreateBudgetDto {
  @IsUUID()
  organizationId: string;

  @IsNumber()
  @Min(2020)
  @Max(2030)
  year: number;

  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @IsEnum(BudgetCategory)
  category: BudgetCategory;

  @IsString()
  item: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  plannedAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
