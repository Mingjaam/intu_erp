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
import { ProgramsService } from './programs.service';
import { CreateProgramDto, UpdateProgramDto, ProgramQueryDto } from './dto/program.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/database/entities/user.entity';

@ApiTags('programs')
@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: '프로그램 생성' })
  @ApiResponse({ status: 201, description: '프로그램이 성공적으로 생성되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiBearerAuth()
  create(@Body() createProgramDto: CreateProgramDto, @Request() req) {
    return this.programsService.create(createProgramDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: '프로그램 목록 조회' })
  @ApiResponse({ status: 200, description: '프로그램 목록을 성공적으로 조회했습니다.' })
  findAll(@Query() query: ProgramQueryDto) {
    console.log('=== 컨트롤러 findAll 호출됨 ===', query);
    return this.programsService.findAll(query, null);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: '관리자용 프로그램 목록 조회' })
  @ApiResponse({ status: 200, description: '관리자용 프로그램 목록을 성공적으로 조회했습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiBearerAuth()
  findAllForAdmin(@Query() query: ProgramQueryDto, @Request() req) {
    return this.programsService.findAll(query, req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: '프로그램 상세 조회' })
  @ApiResponse({ status: 200, description: '프로그램 상세 정보를 성공적으로 조회했습니다.' })
  @ApiResponse({ status: 404, description: '프로그램을 찾을 수 없습니다.' })
  @ApiResponse({ status: 403, description: '접근 권한이 없습니다.' })
  findOne(@Param('id') id: string, @Request() req) {
    console.log('프로그램 상세 조회 요청:', { id, user: req.user });
    return this.programsService.findOne(id, req.user);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '프로그램 통계 조회' })
  @ApiResponse({ status: 200, description: '프로그램 통계를 성공적으로 조회했습니다.' })
  @ApiBearerAuth()
  getStats(@Param('id') id: string, @Request() req) {
    return this.programsService.getProgramStats(id, req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: '프로그램 수정' })
  @ApiResponse({ status: 200, description: '프로그램이 성공적으로 수정되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '프로그램을 찾을 수 없습니다.' })
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() updateProgramDto: UpdateProgramDto, @Request() req) {
    return this.programsService.update(id, updateProgramDto, req.user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: '프로그램 삭제' })
  @ApiResponse({ status: 200, description: '프로그램이 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '프로그램을 찾을 수 없습니다.' })
  @ApiBearerAuth()
  remove(@Param('id') id: string, @Request() req) {
    return this.programsService.remove(id, req.user);
  }
}
