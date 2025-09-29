import { Controller, Get, UseGuards, Query, Request, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole, User } from '@/database/entities/user.entity';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard.dto';
import { Response } from 'express';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OPERATOR)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: '대시보드 통계 조회' })
  @ApiResponse({ status: 200, description: '대시보드 통계를 성공적으로 조회했습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiQuery({ name: 'dateRange', required: false, description: '날짜 범위 (today, week, month, quarter, year)' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작 날짜 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료 날짜 (YYYY-MM-DD)' })
  async getStats(@Query() query: DashboardQueryDto, @Request() req: { user: User }) {
    return this.dashboardService.getDashboardStats(query, req.user);
  }

  @Get('health')
  @ApiOperation({ summary: '시스템 상태 조회' })
  @ApiResponse({ status: 200, description: '시스템 상태를 성공적으로 조회했습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  async getSystemHealth() {
    return this.dashboardService.getSystemHealth();
  }

  @Get('export')
  @ApiOperation({ summary: '데이터 엑셀 다운로드' })
  @ApiResponse({ status: 200, description: '엑셀 파일이 성공적으로 생성되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiQuery({ name: 'type', required: true, description: '내보낼 데이터 타입 (users, programs, applications)' })
  async exportData(@Query('type') type: string, @Res() res: Response, @Request() req: { user: User }) {
    try {
      const excelBuffer = await this.dashboardService.exportData(type, req.user);
      
      const filename = `${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': excelBuffer.length.toString(),
      });
      
      res.send(excelBuffer);
    } catch (error) {
      res.status(500).json({ 
        message: '엑셀 파일 생성 중 오류가 발생했습니다.',
        error: error.message 
      });
    }
  }
}
