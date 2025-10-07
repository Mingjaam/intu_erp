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
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationDto, ApplicationQueryDto } from './dto/application.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/database/entities/user.entity';

@ApiTags('applications')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: '신청서 제출' })
  @ApiResponse({ status: 201, description: '신청서가 성공적으로 제출되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 409, description: '이미 신청한 프로그램입니다.' })
  create(@Body() createApplicationDto: CreateApplicationDto, @Request() req) {
    return this.applicationsService.create(createApplicationDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: '신청서 목록 조회' })
  @ApiResponse({ status: 200, description: '신청서 목록을 성공적으로 조회했습니다.' })
  findAll(@Query() query: ApplicationQueryDto, @Request() req) {
    return this.applicationsService.findAll(query, req.user);
  }

  @Get('programs/:programId')
  @ApiOperation({ summary: '특정 프로그램의 신청서 목록 조회' })
  @ApiResponse({ status: 200, description: '프로그램 신청서 목록을 성공적으로 조회했습니다.' })
  findByProgram(@Param('programId') programId: string, @Query() query: ApplicationQueryDto, @Request() req) {
    return this.applicationsService.findAll({ ...query, programId }, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: '신청서 상세 조회' })
  @ApiResponse({ status: 200, description: '신청서 상세 정보를 성공적으로 조회했습니다.' })
  @ApiResponse({ status: 404, description: '신청서를 찾을 수 없습니다.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.applicationsService.findOne(id, req.user);
  }

  @Get('programs/:programId/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
  @ApiOperation({ summary: '프로그램 신청서 통계 조회' })
  @ApiResponse({ status: 200, description: '신청서 통계를 성공적으로 조회했습니다.' })
  getStats(@Param('programId') programId: string, @Request() req) {
    return this.applicationsService.getApplicationStats(programId, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '신청서 수정' })
  @ApiResponse({ status: 200, description: '신청서가 성공적으로 수정되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '신청서를 찾을 수 없습니다.' })
  update(@Param('id') id: string, @Body() updateApplicationDto: UpdateApplicationDto, @Request() req) {
    return this.applicationsService.update(id, updateApplicationDto, req.user);
  }

  @Patch(':id/withdraw')
  @ApiOperation({ summary: '신청서 철회' })
  @ApiResponse({ status: 200, description: '신청서가 성공적으로 철회되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '신청서를 찾을 수 없습니다.' })
  withdraw(@Param('id') id: string, @Request() req) {
    return this.applicationsService.withdraw(id, req.user);
  }

  @Patch(':id/review')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: '신청서 심사' })
  @ApiResponse({ status: 200, description: '신청서가 성공적으로 심사되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '신청서를 찾을 수 없습니다.' })
  @ApiResponse({ status: 409, description: '이미 처리된 신청서입니다.' })
  review(@Param('id') id: string, @Body() body: { decision: 'selected' | 'rejected' }, @Request() req) {
    return this.applicationsService.reviewApplication(id, body.decision, req.user);
  }

  @Patch(':id/payment')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
  @ApiOperation({ summary: '입금 상태 업데이트' })
  @ApiResponse({ status: 200, description: '입금 상태가 성공적으로 업데이트되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '신청서를 찾을 수 없습니다.' })
  updatePaymentStatus(@Param('id') id: string, @Body() body: { isPaymentReceived: boolean }, @Request() req) {
    return this.applicationsService.updatePaymentStatus(id, body.isPaymentReceived, req.user);
  }
}
