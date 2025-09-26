import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, IsEnum, IsBoolean, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from '@/database/entities/user.entity';

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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
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

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ChangeUserRoleDto {
  @ApiProperty({ enum: UserRole, example: UserRole.STAFF })
  @IsEnum(UserRole)
  role: UserRole;
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
