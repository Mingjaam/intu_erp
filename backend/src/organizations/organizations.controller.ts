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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto, OrganizationQueryDto } from './dto/organization.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/database/entities/user.entity';

@ApiTags('organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: '조직 생성' })
  @ApiResponse({ status: 201, description: '조직이 성공적으로 생성되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  create(@Body() createOrganizationDto: CreateOrganizationDto, @Request() req) {
    return this.organizationsService.create(createOrganizationDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: '조직 목록 조회' })
  @ApiResponse({ status: 200, description: '조직 목록을 성공적으로 조회했습니다.' })
  findAll(@Query() query: OrganizationQueryDto, @Request() req) {
    return this.organizationsService.findAll(query, req.user);
  }

  @Get('types')
  @ApiOperation({ summary: '조직 유형별 통계 조회' })
  @ApiResponse({ status: 200, description: '조직 유형별 통계를 성공적으로 조회했습니다.' })
  getTypes() {
    return this.organizationsService.getOrganizationTypes();
  }

  @Get(':id')
  @ApiOperation({ summary: '조직 상세 조회' })
  @ApiResponse({ status: 200, description: '조직 상세 정보를 성공적으로 조회했습니다.' })
  @ApiResponse({ status: 404, description: '조직을 찾을 수 없습니다.' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.organizationsService.findOne(id, req.user);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: '조직 통계 조회' })
  @ApiResponse({ status: 200, description: '조직 통계를 성공적으로 조회했습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  getStats(@Param('id') id: string, @Request() req) {
    return this.organizationsService.getOrganizationStats(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({ summary: '조직 수정' })
  @ApiResponse({ status: 200, description: '조직이 성공적으로 수정되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '조직을 찾을 수 없습니다.' })
  update(@Param('id') id: string, @Body() updateOrganizationDto: UpdateOrganizationDto, @Request() req) {
    return this.organizationsService.update(id, updateOrganizationDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OPERATOR)
  @ApiOperation({ summary: '조직 삭제' })
  @ApiResponse({ status: 200, description: '조직이 성공적으로 삭제되었습니다.' })
  @ApiResponse({ status: 403, description: '권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '조직을 찾을 수 없습니다.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.organizationsService.remove(id, req.user);
  }
}
