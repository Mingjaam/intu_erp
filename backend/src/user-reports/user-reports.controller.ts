import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserReportsService } from './user-reports.service';
import { CreateUserReportDto, UpdateUserReportDto, UserReportResponseDto, UserReportQueryDto } from './dto/user-report.dto';
import { PaginationDto } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('User Reports')
@Controller('user-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserReportsController {
  constructor(private readonly userReportsService: UserReportsService) {}

  @Post()
  @ApiOperation({ summary: '회원 신고 생성' })
  @ApiResponse({
    status: 201,
    description: '회원 신고 생성 성공',
    type: UserReportResponseDto,
  })
  async create(@Body() createUserReportDto: CreateUserReportDto, @Request() req): Promise<ApiResponseDto<UserReportResponseDto>> {
    const report = await this.userReportsService.create(createUserReportDto, req.user);
    return new ApiResponseDto(report, true, '회원 신고가 접수되었습니다.');
  }

  @Get()
  @ApiOperation({ summary: '회원 신고 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '회원 신고 목록 조회 성공',
  })
  async findAll(@Query() query: UserReportQueryDto, @Request() req): Promise<ApiResponseDto<any>> {
    const result = await this.userReportsService.findAll(query, req.user);
    return new ApiResponseDto({
      reports: result.reports,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }
    }, true, '회원 신고 목록을 조회했습니다.');
  }

  @Get(':id')
  @ApiOperation({ summary: '회원 신고 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '회원 신고 상세 조회 성공',
    type: UserReportResponseDto,
  })
  async findOne(@Param('id') id: string, @Request() req): Promise<ApiResponseDto<UserReportResponseDto>> {
    const report = await this.userReportsService.findOne(id, req.user);
    return new ApiResponseDto(report, true, '회원 신고를 조회했습니다.');
  }


  @Delete(':id')
  @ApiOperation({ summary: '회원 신고 삭제' })
  @ApiResponse({
    status: 200,
    description: '회원 신고 삭제 성공',
  })
  async remove(@Param('id') id: string, @Request() req): Promise<ApiResponseDto<void>> {
    await this.userReportsService.remove(id, req.user);
    return new ApiResponseDto(null, true, '회원 신고가 삭제되었습니다.');
  }
}

