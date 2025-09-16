import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/database/entities/user.entity';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard.dto';

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
  async getStats(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getDashboardStats(query);
  }

  @Get('health')
  @ApiOperation({ summary: '시스템 상태 조회' })
  @ApiResponse({ status: 200, description: '시스템 상태를 성공적으로 조회했습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  async getSystemHealth() {
    return this.dashboardService.getSystemHealth();
  }

  @Get('export')
  @ApiOperation({ summary: '데이터 내보내기' })
  @ApiResponse({ status: 200, description: '데이터를 성공적으로 내보냈습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiQuery({ name: 'type', required: true, description: '내보낼 데이터 타입 (users, programs, applications)' })
  async exportData(@Query('type') type: string) {
    // 실제 구현에서는 CSV 또는 Excel 파일을 생성하여 반환
    return {
      message: `${type} 데이터 내보내기 기능은 구현 예정입니다.`,
      type,
      timestamp: new Date().toISOString(),
    };
  }
}
