import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VisitsService } from './visits.service';
import { CreateVisitDto, UpdateVisitDto, VisitQueryDto } from './dto/visit.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/database/entities/user.entity';

@ApiTags('visits')
@Controller('visits')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.REVIEWER)
  @ApiOperation({ summary: '방문 예약' })
  @ApiResponse({ status: 201, description: '방문이 성공적으로 예약되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '조직 또는 프로그램을 찾을 수 없습니다.' })
  create(@Body() createVisitDto: CreateVisitDto, @Request() req) {
    return this.visitsService.create(createVisitDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: '방문 목록 조회' })
  @ApiResponse({ status: 200, description: '방문 목록을 성공적으로 조회했습니다.' })
  findAll(@Query() query: VisitQueryDto, @Request() req) {
    return this.visitsService.findAll(query, req.user);
  }

  @Get('programs/:programId')
  @ApiOperation({ summary: '특정 프로그램의 방문 목록 조회' })
  @ApiResponse({ status: 200, description: '프로그램 방문 목록을 성공적으로 조회했습니다.' })
  findByProgram(@Param('programId') programId: string, @Query() query: VisitQueryDto, @Request() req) {
    return this.visitsService.findAll({ ...query, programId }, req.user);
  }

  @Get('programs/:programId/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.REVIEWER)
  @ApiOperation({ summary: '프로그램 방문 통계 조회' })
  @ApiResponse({ status: 200, description: '방문 통계를 성공적으로 조회했습니다.' })
  getStats(@Param('programId') programId: string, @Request() req) {
    return this.visitsService.getVisitStats(programId, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: '방문 상세 조회' })
  @ApiResponse({ status: 200, description: '방문 상세 정보를 성공적으로 조회했습니다.' })
  @ApiResponse({ status: 404, description: '방문 정보를 찾을 수 없습니다.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.visitsService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '방문 수정' })
  @ApiResponse({ status: 200, description: '방문이 성공적으로 수정되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '방문 정보를 찾을 수 없습니다.' })
  update(@Param('id') id: string, @Body() updateVisitDto: UpdateVisitDto, @Request() req) {
    return this.visitsService.update(id, updateVisitDto, req.user);
  }

  @Patch(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.REVIEWER)
  @ApiOperation({ summary: '방문 완료 처리' })
  @ApiResponse({ status: 200, description: '방문이 성공적으로 완료되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '방문 정보를 찾을 수 없습니다.' })
  complete(@Param('id') id: string, @Body() body: { outcome: Record<string, any> }, @Request() req) {
    return this.visitsService.complete(id, body.outcome, req.user);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: '방문 취소' })
  @ApiResponse({ status: 200, description: '방문이 성공적으로 취소되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '방문 정보를 찾을 수 없습니다.' })
  cancel(@Param('id') id: string, @Body() body: { reason: string }, @Request() req) {
    return this.visitsService.cancel(id, body.reason, req.user);
  }
}
