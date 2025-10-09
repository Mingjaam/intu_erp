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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto, ChangeUserRoleDto, ChangePasswordDto } from './dto/user.dto';
import { PaginationDto } from '../common/dto/api-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../database/entities/user.entity';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
  @ApiOperation({ summary: '사용자 생성' })
  @ApiResponse({
    status: 201,
    description: '사용자 생성 성공',
    type: UserResponseDto,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.usersService.create(createUserDto);
    return new ApiResponseDto(user, true, '사용자가 생성되었습니다.');
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
  @ApiOperation({ summary: '전체 사용자 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '전체 사용자 목록 조회 성공',
  })
  async findAll(@Query() pagination: PaginationDto, @Request() req): Promise<ApiResponseDto<any>> {
    const result = await this.usersService.findAll(pagination, req.user);
    return new ApiResponseDto({
      users: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }
    }, true, '전체 사용자 목록을 조회했습니다.');
  }

  @Get('manageable')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
  @ApiOperation({ summary: '관리 가능한 사용자 목록 조회 (역할 변경 가능)' })
  @ApiResponse({
    status: 200,
    description: '관리 가능한 사용자 목록 조회 성공',
  })
  async findManageable(@Query() pagination: PaginationDto, @Request() req): Promise<ApiResponseDto<any>> {
    const result = await this.usersService.findManageable(pagination, req.user);
    return new ApiResponseDto({
      users: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }
    }, true, '관리 가능한 사용자 목록을 조회했습니다.');
  }

  @Get('staff')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
  @ApiOperation({ summary: '직원 관리 목록 조회 (같은 조직의 운영자, 직원)' })
  @ApiResponse({
    status: 200,
    description: '직원 관리 목록 조회 성공',
  })
  async findStaff(@Query() pagination: PaginationDto, @Request() req): Promise<ApiResponseDto<any>> {
    const result = await this.usersService.findStaff(pagination, req.user);
    return new ApiResponseDto({
      users: result.users,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      }
    }, true, '직원 관리 목록을 조회했습니다.');
  }

  @Get('profile')
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: UserResponseDto,
  })
  async getProfile(@Request() req): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.usersService.findOne(req.user.id);
    return new ApiResponseDto(user, true, '프로필을 조회했습니다.');
  }

  @Patch('profile')
  @ApiOperation({ summary: '내 프로필 수정' })
  @ApiResponse({
    status: 200,
    description: '프로필 수정 성공',
    type: UserResponseDto,
  })
  async updateProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.usersService.updateProfile(req.user.id, updateUserDto);
    return new ApiResponseDto(user, true, '프로필이 수정되었습니다.');
  }

  @Get('by-role/:role')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
  @ApiOperation({ summary: '역할별 사용자 조회' })
  @ApiResponse({
    status: 200,
    description: '역할별 사용자 조회 성공',
  })
  async findByRole(@Param('role') role: UserRole): Promise<ApiResponseDto<UserResponseDto[]>> {
    const users = await this.usersService.findByRole(role);
    return new ApiResponseDto(users, true, '역할별 사용자를 조회했습니다.');
  }

  @Get('by-organization/:organizationId')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
  @ApiOperation({ summary: '조직별 사용자 조회' })
  @ApiResponse({
    status: 200,
    description: '조직별 사용자 조회 성공',
  })
  async findByOrganization(@Param('organizationId') organizationId: string): Promise<ApiResponseDto<UserResponseDto[]>> {
    const users = await this.usersService.findByOrganization(organizationId);
    return new ApiResponseDto(users, true, '조직별 사용자를 조회했습니다.');
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
  @ApiOperation({ summary: '사용자 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 상세 조회 성공',
    type: UserResponseDto,
  })
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.usersService.findOne(id);
    return new ApiResponseDto(user, true, '사용자 정보를 조회했습니다.');
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
  @ApiOperation({ summary: '사용자 정보 수정' })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 수정 성공',
    type: UserResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.usersService.update(id, updateUserDto);
    return new ApiResponseDto(user, true, '사용자 정보가 수정되었습니다.');
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
  @ApiOperation({ summary: '사용자 역할 변경' })
  @ApiResponse({
    status: 200,
    description: '사용자 역할 변경 성공',
    type: UserResponseDto,
  })
  async changeRole(
    @Param('id') id: string,
    @Body() changeUserRoleDto: ChangeUserRoleDto,
    @Request() req,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.usersService.changeRole(id, changeUserRoleDto, req.user);
    return new ApiResponseDto(user, true, '사용자 역할이 변경되었습니다.');
  }

  @Patch(':id/memo')
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.STAFF)
  @ApiOperation({ summary: '사용자 메모 수정' })
  @ApiResponse({
    status: 200,
    description: '사용자 메모 수정 성공',
    type: UserResponseDto,
  })
  async updateMemo(
    @Param('id') id: string,
    @Body() body: { memo: string },
    @Request() req,
  ): Promise<ApiResponseDto<UserResponseDto>> {
    const user = await this.usersService.updateMemo(id, body.memo, req.user);
    return new ApiResponseDto(user, true, '사용자 메모가 수정되었습니다.');
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({
    status: 200,
    description: '비밀번호 변경 성공',
  })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ApiResponseDto<null>> {
    await this.usersService.changePassword(req.user.id, changePasswordDto);
    return new ApiResponseDto(null, true, '비밀번호가 변경되었습니다.');
  }

}
