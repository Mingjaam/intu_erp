import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Gender } from '@/database/entities/user.entity';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'admin', required: false })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiProperty({ example: '010-1234-5678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'village-uuid', required: false })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE, required: false })
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

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId?: string;
    organization?: {
      id: string;
      name: string;
      type: string;
    };
  };
}
