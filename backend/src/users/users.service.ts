import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../database/entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto, ChangeUserRoleDto, ChangePasswordDto } from './dto/user.dto';
import { PaginationDto } from '../common/dto/api-response.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 12);

    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    return this.toResponseDto(savedUser);
  }

  async findAll(pagination: PaginationDto, _currentUser: User): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoin('user_reports', 'report', 'report.reportedUserId = user.id')
      .addSelect('COUNT(DISTINCT report.id)', 'reportCount')
      .groupBy('user.id, organization.id, organization.name, organization.type, organization.address, organization.contact, organization.description, organization.isActive, organization.createdAt, organization.updatedAt');

    // 모든 역할이 모든 사용자 조회 가능

    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy(`user.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const { entities: users, raw } = await queryBuilder.getRawAndEntities();
    
    // 총 개수를 별도로 조회
    const totalQuery = this.userRepository.createQueryBuilder('user');
    if (search) {
      totalQuery.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    const totalCount = await totalQuery.getCount();

    return {
      users: users.map((user, index) => this.toResponseDtoWithReportCount(user, raw[index])),
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async findManageable(pagination: PaginationDto, _currentUser: User): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoin('user_reports', 'report', 'report.reportedUserId = user.id')
      .addSelect('COUNT(DISTINCT report.id)', 'reportCount')
      .groupBy('user.id, organization.id, organization.name, organization.type, organization.address, organization.contact, organization.description, organization.isActive, organization.createdAt, organization.updatedAt');

    // 모든 역할이 모든 사용자 조회 가능

    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy(`user.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const { entities: users, raw } = await queryBuilder.getRawAndEntities();
    
    // 총 개수를 별도로 조회
    const totalQuery = this.userRepository.createQueryBuilder('user');
    if (search) {
      totalQuery.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    const totalCount = await totalQuery.getCount();

    return {
      users: users.map((user, index) => this.toResponseDtoWithReportCount(user, raw[index])),
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async findStaff(pagination: PaginationDto, currentUser: User): Promise<{
    users: UserResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = pagination;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoin('user_reports', 'report', 'report.reportedUserId = user.id')
      .addSelect('COUNT(DISTINCT report.id)', 'reportCount')
      .groupBy('user.id, organization.id, organization.name, organization.type, organization.address, organization.contact, organization.description, organization.isActive, organization.createdAt, organization.updatedAt');

    // 같은 조직의 운영자와 직원만 조회
    queryBuilder.andWhere('user.organizationId = :organizationId', { 
      organizationId: currentUser.organizationId 
    });
    queryBuilder.andWhere('user.role IN (:...roles)', { 
      roles: [UserRole.OPERATOR, UserRole.STAFF] 
    });

    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder
      .orderBy(`user.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const { entities: users, raw } = await queryBuilder.getRawAndEntities();
    
    // 총 개수를 별도로 조회
    const totalQuery = this.userRepository.createQueryBuilder('user');
    totalQuery.andWhere('user.organizationId = :organizationId', { 
      organizationId: currentUser.organizationId 
    });
    totalQuery.andWhere('user.role IN (:...roles)', { 
      roles: [UserRole.OPERATOR, UserRole.STAFF] 
    });
    if (search) {
      totalQuery.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }
    const totalCount = await totalQuery.getCount();

    return {
      users: users.map((user, index) => this.toResponseDtoWithReportCount(user, raw[index])),
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toResponseDto(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // 날짜 필드 처리
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.hireDate && updateUserDto.hireDate.trim() !== '') {
      updateData.hireDate = new Date(updateUserDto.hireDate);
    } else if (updateUserDto.hireDate === '') {
      updateData.hireDate = null;
    }
    if (updateUserDto.resignationDate && updateUserDto.resignationDate.trim() !== '') {
      updateData.resignationDate = new Date(updateUserDto.resignationDate);
    } else if (updateUserDto.resignationDate === '') {
      updateData.resignationDate = null;
    }

    await this.userRepository.update(id, updateData);
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });

    return this.toResponseDto(updatedUser);
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // 일반 사용자는 역할과 조직 정보를 변경할 수 없음
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { role: _role, organizationId: _organizationId, isActive: _isActive, ...allowedFields } = updateUserDto;
    
    await this.userRepository.update(userId, allowedFields);
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    return this.toResponseDto(updatedUser);
  }


  async findByRole(role: UserRole): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      where: { role, isActive: true },
      relations: ['organization'],
    });

    return users.map(user => this.toResponseDto(user));
  }

  async findByOrganization(organizationId: string): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find({
      where: { organizationId, isActive: true },
      relations: ['organization'],
    });

    return users.map(user => this.toResponseDto(user));
  }

  async getUserReportCount(userId: string): Promise<number> {
    const count = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user_reports', 'report', 'report.reportedUserId = user.id')
      .where('user.id = :userId', { userId })
      .getCount();

    return count;
  }

  async changeRole(id: string, changeUserRoleDto: ChangeUserRoleDto, currentUser: User): Promise<UserResponseDto> {
    const targetUser = await this.userRepository.findOne({ 
      where: { id },
      relations: ['organization']
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // 권한 체크
    if (currentUser.role === UserRole.OPERATOR || currentUser.role === UserRole.STAFF) {
      // 운영자와 직원은 운영자, 직원, 신청자만 부여 가능
      if (changeUserRoleDto.role === UserRole.ADMIN) {
        throw new ConflictException('관리자 역할을 부여할 수 없습니다.');
      }
      // 같은 조직 내에서만 가능
      if (targetUser.organizationId !== currentUser.organizationId) {
        throw new ConflictException('같은 조직의 사용자만 역할을 변경할 수 있습니다.');
      }
    }
    
    // 관리자 역할은 아무도 변경할 수 없음
    if (targetUser.role === UserRole.ADMIN) {
      throw new ConflictException('관리자 역할은 변경할 수 없습니다.');
    }
    
    // 관리자는 운영자, 직원, 신청자만 부여 가능 (자기 자신 제외)
    if (currentUser.role === UserRole.ADMIN && changeUserRoleDto.role === UserRole.ADMIN && targetUser.id !== currentUser.id) {
      throw new ConflictException('관리자 역할은 다른 사용자에게 부여할 수 없습니다.');
    }

    // 역할 변경 시 조직 이동 로직
    const updateData: any = { role: changeUserRoleDto.role };
    
    // 운영자(operator) 역할로 변경하는 경우, 지정된 조직으로 이동
    if (changeUserRoleDto.role === UserRole.OPERATOR) {
      if (changeUserRoleDto.organizationId) {
        // 지정된 조직이 있는 경우 해당 조직으로 이동
        updateData.organizationId = changeUserRoleDto.organizationId;
      } else {
        // 조직이 지정되지 않은 경우 현재 사용자의 조직으로 이동
        updateData.organizationId = currentUser.organizationId;
      }
    }
    
    // 직원(staff) 역할로 변경하는 경우, 부여한 사람의 조직으로 이동
    if (changeUserRoleDto.role === UserRole.STAFF && currentUser.organizationId) {
      updateData.organizationId = currentUser.organizationId;
    }
    
    // 신청자(applicant) 역할로 변경하는 경우, 조직에서 제거하고 메모 삭제
    if (changeUserRoleDto.role === UserRole.APPLICANT) {
      updateData.organizationId = null;
      updateData.memo = null;
    }

    await this.userRepository.update(id, updateData);
    const updatedUser = await this.userRepository.findOne({
      where: { id },
      relations: ['organization'],
    });

    return this.toResponseDto(updatedUser);
  }


  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization ? {
        id: user.organization.id,
        name: user.organization.name,
        type: user.organization.type,
      } : undefined,
      phone: user.phone,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      memo: user.memo,
      position: user.position,
      contractType: user.contractType,
      hireDate: user.hireDate,
      resignationDate: user.resignationDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateMemo(userId: string, memo: string, currentUser: any): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['organization'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 권한 검증: 같은 조직의 사용자만 메모 수정 가능
    if (currentUser.role !== 'admin' && currentUser.organizationId !== user.organizationId) {
      throw new ConflictException('같은 조직의 사용자만 메모를 수정할 수 있습니다.');
    }

    user.memo = memo;
    const updatedUser = await this.userRepository.save(user);
    return this.toResponseDto(updatedUser);
  }

  private toResponseDtoWithReportCount(user: any, rawData?: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization ? {
        id: user.organization.id,
        name: user.organization.name,
        type: user.organization.type,
      } : undefined,
      phone: user.phone,
      isActive: user.isActive,
      reportCount: rawData ? parseInt(rawData.reportCount) || 0 : 0,
      lastLoginAt: user.lastLoginAt,
      memo: user.memo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    // 입력값 검증
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException('새 비밀번호는 현재 비밀번호와 달라야 합니다.');
    }

    // 사용자 조회
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('현재 비밀번호가 올바르지 않습니다.');
    }

    // 새 비밀번호 해시화
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
    });
  }
}
