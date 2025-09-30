import { IsString, IsOptional, IsBoolean, IsDateString, IsUUID } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  title: string;

  @IsDateString()
  date: string;
}

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}

export class TodoQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
