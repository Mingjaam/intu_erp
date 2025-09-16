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
import { SelectionsService } from './selections.service';
import { CreateSelectionDto, UpdateSelectionDto, SelectionQueryDto } from './dto/selection.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/database/entities/user.entity';

@ApiTags('selections')
@Controller('selections')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SelectionsController {
  constructor(private readonly selectionsService: SelectionsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.REVIEWER)
  @ApiOperation({ summary: '선정 처리' })
  @ApiResponse({ status: 201, description: '선정이 성공적으로 처리되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '신청서를 찾을 수 없습니다.' })
  @ApiResponse({ status: 409, description: '이미 선정 처리된 신청서입니다.' })
  create(@Body() createSelectionDto: CreateSelectionDto, @Request() req) {
    return this.selectionsService.create(createSelectionDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: '선정 목록 조회' })
  @ApiResponse({ status: 200, description: '선정 목록을 성공적으로 조회했습니다.' })
  findAll(@Query() query: SelectionQueryDto, @Request() req) {
    return this.selectionsService.findAll(query, req.user);
  }

  @Get('programs/:programId')
  @ApiOperation({ summary: '특정 프로그램의 선정 목록 조회' })
  @ApiResponse({ status: 200, description: '프로그램 선정 목록을 성공적으로 조회했습니다.' })
  findByProgram(@Param('programId') programId: string, @Query() query: SelectionQueryDto, @Request() req) {
    return this.selectionsService.findAll({ ...query, programId }, req.user);
  }

  @Get('programs/:programId/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.REVIEWER)
  @ApiOperation({ summary: '프로그램 선정 통계 조회' })
  @ApiResponse({ status: 200, description: '선정 통계를 성공적으로 조회했습니다.' })
  getStats(@Param('programId') programId: string, @Request() req) {
    return this.selectionsService.getSelectionStats(programId, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: '선정 상세 조회' })
  @ApiResponse({ status: 200, description: '선정 상세 정보를 성공적으로 조회했습니다.' })
  @ApiResponse({ status: 404, description: '선정 정보를 찾을 수 없습니다.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.selectionsService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.REVIEWER)
  @ApiOperation({ summary: '선정 수정' })
  @ApiResponse({ status: 200, description: '선정이 성공적으로 수정되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '선정 정보를 찾을 수 없습니다.' })
  update(@Param('id') id: string, @Body() updateSelectionDto: UpdateSelectionDto, @Request() req) {
    return this.selectionsService.update(id, updateSelectionDto, req.user);
  }
}
