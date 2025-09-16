import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '사용자 로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseDto<AuthResponseDto>> {
    const result = await this.authService.login(loginDto);
    return new ApiResponseDto(result, true, '로그인에 성공했습니다.');
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '사용자 회원가입' })
  @ApiResponse({
    status: 201,
    description: '회원가입 성공',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 409, description: '이미 존재하는 이메일' })
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponseDto<AuthResponseDto>> {
    const result = await this.authService.register(registerDto);
    return new ApiResponseDto(result, true, '회원가입에 성공했습니다.');
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 프로필 조회' })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
  })
  async getProfile(@Request() req): Promise<ApiResponseDto<any>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...user } = req.user;
    return new ApiResponseDto(user, true, '프로필을 조회했습니다.');
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({
    status: 200,
    description: '토큰 갱신 성공',
  })
  async refreshToken(@Request() req): Promise<ApiResponseDto<{ accessToken: string }>> {
    const result = await this.authService.refreshToken(req.user);
    return new ApiResponseDto(result, true, '토큰이 갱신되었습니다.');
  }
}
