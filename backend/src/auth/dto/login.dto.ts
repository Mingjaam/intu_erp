import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

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

  @ApiProperty({ example: '010-1234-5678', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'village-uuid', required: false })
  @IsString()
  @IsOptional()
  organizationId?: string;
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
  };
}
