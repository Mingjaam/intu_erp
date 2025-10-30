import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, IsNotEmpty, MinLength, IsInt, Min, Max } from 'class-validator';
import { UserRole, Gender } from '@/database/entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  name: string;

  @ApiProperty({ example: '010-1234-5678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.APPLICANT })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'organization-uuid', required: false })
  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '홍길동', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '010-1234-5678', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ example: 'organization-uuid', required: false })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty({ example: '마을 내 역할 메모', required: false })
  @IsOptional()
  @IsString()
  memo?: string;

  @ApiProperty({ example: '팀장', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: '정규직', required: false })
  @IsOptional()
  @IsString()
  contractType?: string;

  @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsString()
  hireDate?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsString()
  resignationDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: 1990, required: false })
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear())
  birthYear?: number;

  @ApiProperty({ example: '서울시', required: false })
  @IsOptional()
  @IsString()
  hometown?: string;

  @ApiProperty({ example: '서울시', required: false })
  @IsOptional()
  @IsString()
  residence?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ required: false })
  organizationId?: string;

  @ApiProperty({ required: false })
  organization?: {
    id: string;
    name: string;
    type: string;
  };

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  reportCount?: number;

  @ApiProperty({ required: false })
  lastLoginAt?: Date;

  @ApiProperty({ required: false })
  memo?: string;

  @ApiProperty({ required: false })
  position?: string;

  @ApiProperty({ required: false })
  contractType?: string;

  @ApiProperty({ required: false })
  hireDate?: Date;

  @ApiProperty({ required: false })
  resignationDate?: Date;

  @ApiProperty({ enum: Gender, required: false })
  gender?: Gender;

  @ApiProperty({ required: false })
  birthYear?: number;

  @ApiProperty({ required: false })
  hometown?: string;

  @ApiProperty({ required: false })
  residence?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ChangeUserRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.STAFF })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'organization-uuid', required: false, description: '운영자 승급 시 할당할 조직 ID' })
  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword123', description: '현재 비밀번호' })
  @IsString({ message: '현재 비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '현재 비밀번호를 입력해주세요.' })
  currentPassword: string;

  @ApiProperty({ example: 'newPassword123', description: '새 비밀번호' })
  @IsString({ message: '새 비밀번호는 문자열이어야 합니다.' })
  @IsNotEmpty({ message: '새 비밀번호를 입력해주세요.' })
  @MinLength(6, { message: '비밀번호는 최소 6자 이상이어야 합니다.' })
  newPassword: string;
}
