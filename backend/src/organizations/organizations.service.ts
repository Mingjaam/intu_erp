import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Organization, OrganizationType } from '@/database/entities/organization.entity';
import { User, UserRole } from '@/database/entities/user.entity';
import { CreateOrganizationDto, UpdateOrganizationDto, OrganizationQueryDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto, user: User): Promise<Organization> {
    // 권한 확인: 관리자 또는 운영자만 조직 생성 가능
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.OPERATOR) {
      throw new ForbiddenException('조직 생성 권한이 없습니다.');
    }

    const organization = this.organizationRepository.create(createOrganizationDto);
    return await this.organizationRepository.save(organization);
  }

  async findAll(query: OrganizationQueryDto, user: User): Promise<{ organizations: Organization[]; total: number }> {
    const { type, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.users', 'users')
      .where('organization.isActive = :isActive', { isActive: true });

    if (type) {
      queryBuilder.andWhere('organization.type = :type', { type });
    }

    if (search) {
      queryBuilder.andWhere(
        '(organization.name ILIKE :search OR organization.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // 정렬 필드 검증 및 적용
    const allowedSortFields = ['createdAt', 'updatedAt', 'name'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const [organizations, total] = await queryBuilder
      .orderBy(`organization.${sortField}`, sortDirection)
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { organizations, total };
  }

  async findOne(id: string, user: User): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id, isActive: true },
      relations: ['users', 'programs', 'visits'],
    });

    if (!organization) {
      throw new NotFoundException('조직을 찾을 수 없습니다.');
    }

    // 권한 확인: 해당 조직 사용자, 관리자, 운영자, 심사자만 조회 가능
    if (
      user.role === UserRole.APPLICANT &&
      organization.id !== user.organizationId
    ) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto, user: User): Promise<Organization> {
    const organization = await this.findOne(id, user);

    // 권한 확인: 관리자, 운영자, 또는 해당 조직 사용자만 수정 가능
    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.OPERATOR &&
      organization.id !== user.organizationId
    ) {
      throw new ForbiddenException('조직 수정 권한이 없습니다.');
    }

    Object.assign(organization, updateOrganizationDto);
    return await this.organizationRepository.save(organization);
  }

  async remove(id: string, user: User): Promise<void> {
    const organization = await this.findOne(id, user);

    // 권한 확인: 관리자 또는 운영자만 삭제 가능
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.OPERATOR) {
      throw new ForbiddenException('조직 삭제 권한이 없습니다.');
    }

    organization.isActive = false;
    await this.organizationRepository.save(organization);
  }

  async getOrganizationStats(id: string, user: User): Promise<any> {
    const organization = await this.findOne(id, user);

    // 권한 확인
    if (user.role === UserRole.APPLICANT && organization.id !== user.organizationId) {
      throw new ForbiddenException('통계 조회 권한이 없습니다.');
    }

    const stats = await this.organizationRepository
      .createQueryBuilder('organization')
      .leftJoin('organization.users', 'users')
      .leftJoin('organization.programs', 'programs')
      .leftJoin('organization.visits', 'visits')
      .where('organization.id = :id', { id })
      .select([
        'COUNT(DISTINCT users.id) as totalUsers',
        'COUNT(DISTINCT programs.id) as totalPrograms',
        'COUNT(DISTINCT visits.id) as totalVisits',
        'COUNT(DISTINCT CASE WHEN programs.status = :open THEN programs.id END) as activePrograms',
        'COUNT(DISTINCT CASE WHEN visits.status = :completed THEN visits.id END) as completedVisits',
      ])
      .setParameters({
        open: 'open',
        completed: 'completed',
      })
      .getRawOne();

    return {
      organizationId: id,
      organizationName: organization.name,
      ...stats,
    };
  }

  async getOrganizationTypes(): Promise<{ type: string; label: string; count: number }[]> {
    const types = Object.values(OrganizationType);
    const result = [];

    for (const type of types) {
      const count = await this.organizationRepository.count({
        where: { type, isActive: true },
      });

      const labels = {
        [OrganizationType.VILLAGE]: '마을',
        [OrganizationType.INSTITUTION]: '기관',
        [OrganizationType.COMPANY]: '기업',
        [OrganizationType.NGO]: '비영리단체',
      };

      result.push({
        type,
        label: labels[type],
        count,
      });
    }

    return result;
  }
}
