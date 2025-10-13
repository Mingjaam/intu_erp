import { Controller, Get, Query, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { ReportsService } from './reports.service';
import { ParticipantReportQueryDto, ParticipantReportResponseDto } from './dto/participant-report.dto';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('participants')
  async getParticipantReport(
    @Query() query: ParticipantReportQueryDto,
    @Req() req: any
  ): Promise<ParticipantReportResponseDto> {
    return this.reportsService.getParticipantReport(query, req.user);
  }

  @Get('participants/excel')
  async exportParticipantReport(
    @Query() query: ParticipantReportQueryDto,
    @Req() req: any,
    @Res() res: Response
  ): Promise<void> {
    const buffer = await this.reportsService.exportParticipantReportToExcel(query, req.user);
    
    const filename = `참여자현황_${query.year || new Date().getFullYear()}_${query.month || new Date().getMonth() + 1}.xlsx`;
    
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Length': buffer.length.toString(),
    });
    
    res.send(buffer);
  }
}
