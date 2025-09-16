import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visit, VisitStatus } from '@/database/entities/visit.entity';
import { Organization } from '@/database/entities/organization.entity';
import { Program } from '@/database/entities/program.entity';
import { User, UserRole } from '@/database/entities/user.entity';
import { CreateVisitDto, UpdateVisitDto, VisitQueryDto } from './dto/visit.dto';

@Injectable()
export class VisitsService {
  constructor(
    @InjectRepository(Visit)
    private visitRepository: Repository<Visit>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Program)
    private programRepository: Repository<Program>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createVisitDto: CreateVisitDto, user: User): Promise<Visit> {
    const { organizationId, programId, scheduledAt, notes, outcome } = createVisitDto;

    // 조직 존재 확인
    const organization = await this.organizationRepository.findOne({
      where: { id: organizationId, isActive: true },
    });

    if (!organization) {
      throw new NotFoundException('조직을 찾을 수 없습니다.');
    }

    // 프로그램 존재 확인
    const program = await this.programRepository.findOne({
      where: { id: programId, isActive: true },
    });

    if (!program) {
      throw new NotFoundException('프로그램을 찾을 수 없습니다.');
    }

    // 권한 확인: 관리자, 운영자, 심사자만 방문 예약 가능
    if (
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.OPERATOR &&
      user.role !== UserRole.REVIEWER
    ) {
      throw new ForbiddenException('방문 예약 권한이 없습니다.');
    }

    const visit = this.visitRepository.create({
      organizationId,
      programId,
      visitorId: user.id,
      scheduledAt: new Date(scheduledAt),
      notes,
      outcome,
      status: VisitStatus.SCHEDULED,
    });

    return await this.visitRepository.save(visit);
  }

  async findAll(query: VisitQueryDto, user: User): Promise<{ visits: Visit[]; total: number }> {
    const { organizationId, programId, visitorId, status, startDate, endDate, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.visitRepository
      .createQueryBuilder('visit')
      .leftJoinAndSelect('visit.organization', 'organization')
      .leftJoinAndSelect('visit.program', 'program')
      .leftJoinAndSelect('visit.visitor', 'visitor');

    // 일반 사용자는 자신이 관련된 방문만 조회 가능
    if (user.role === UserRole.APPLICANT) {
      queryBuilder.andWhere(
        '(visit.visitorId = :userId OR visit.organizationId IN (SELECT u.organizationId FROM users u WHERE u.id = :userId))',
        { userId: user.id }
      );
    }

    if (organizationId) {
      queryBuilder.andWhere('visit.organizationId = :organizationId', { organizationId });
    }

    if (programId) {
      queryBuilder.andWhere('visit.programId = :programId', { programId });
    }

    if (visitorId) {
      queryBuilder.andWhere('visit.visitorId = :visitorId', { visitorId });
    }

    if (status) {
      queryBuilder.andWhere('visit.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('visit.scheduledAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('visit.scheduledAt <= :endDate', { endDate });
    }

    const [visits, total] = await queryBuilder
      .orderBy('visit.scheduledAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { visits, total };
  }

  async findOne(id: string, user: User): Promise<Visit> {
    const visit = await this.visitRepository.findOne({
      where: { id },
      relations: ['organization', 'program', 'visitor'],
    });

    if (!visit) {
      throw new NotFoundException('방문 정보를 찾을 수 없습니다.');
    }

    // 권한 확인: 방문자 본인, 해당 조직 사용자, 관리자, 운영자, 심사자만 조회 가능
    if (
      user.role === UserRole.APPLICANT &&
      visit.visitorId !== user.id &&
      visit.organizationId !== user.organizationId
    ) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return visit;
  }

  async update(id: string, updateVisitDto: UpdateVisitDto, user: User): Promise<Visit> {
    const visit = await this.findOne(id, user);

    // 권한 확인: 방문자 본인, 관리자, 운영자, 심사자만 수정 가능
    if (
      user.role === UserRole.APPLICANT &&
      visit.visitorId !== user.id
    ) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    const { scheduledAt, performedAt, notes, outcome, status, followUpNotes } = updateVisitDto;

    if (scheduledAt) {
      visit.scheduledAt = new Date(scheduledAt);
    }

    if (performedAt) {
      visit.performedAt = new Date(performedAt);
    }

    if (notes !== undefined) {
      visit.notes = notes;
    }

    if (outcome !== undefined) {
      visit.outcome = outcome;
    }

    if (status !== undefined) {
      visit.status = status;
    }

    if (followUpNotes !== undefined) {
      visit.followUpNotes = followUpNotes;
    }

    return await this.visitRepository.save(visit);
  }

  async complete(id: string, outcome: Record<string, any>, user: User): Promise<Visit> {
    const visit = await this.findOne(id, user);

    // 권한 확인: 방문자 본인, 관리자, 운영자, 심사자만 완료 처리 가능
    if (
      user.role === UserRole.APPLICANT &&
      visit.visitorId !== user.id
    ) {
      throw new ForbiddenException('완료 처리 권한이 없습니다.');
    }

    visit.status = VisitStatus.COMPLETED;
    visit.performedAt = new Date();
    visit.outcome = outcome;

    return await this.visitRepository.save(visit);
  }

  async cancel(id: string, reason: string, user: User): Promise<Visit> {
    const visit = await this.findOne(id, user);

    // 권한 확인: 방문자 본인, 관리자, 운영자, 심사자만 취소 가능
    if (
      user.role === UserRole.APPLICANT &&
      visit.visitorId !== user.id
    ) {
      throw new ForbiddenException('취소 권한이 없습니다.');
    }

    visit.status = VisitStatus.CANCELLED;
    visit.notes = visit.notes ? `${visit.notes}\n취소 사유: ${reason}` : `취소 사유: ${reason}`;

    return await this.visitRepository.save(visit);
  }

  async getVisitStats(programId: string, user: User): Promise<any> {
    // 권한 확인
    if (user.role === UserRole.APPLICANT) {
      throw new ForbiddenException('통계 조회 권한이 없습니다.');
    }

    const stats = await this.visitRepository
      .createQueryBuilder('visit')
      .where('visit.programId = :programId', { programId })
      .select([
        'COUNT(visit.id) as totalVisits',
        'COUNT(CASE WHEN visit.status = :scheduled THEN 1 END) as scheduledCount',
        'COUNT(CASE WHEN visit.status = :completed THEN 1 END) as completedCount',
        'COUNT(CASE WHEN visit.status = :cancelled THEN 1 END) as cancelledCount',
        'COUNT(CASE WHEN visit.status = :postponed THEN 1 END) as postponedCount',
      ])
      .setParameters({
        scheduled: VisitStatus.SCHEDULED,
        completed: VisitStatus.COMPLETED,
        cancelled: VisitStatus.CANCELLED,
        postponed: VisitStatus.POSTPONED,
      })
      .getRawOne();

    return {
      programId,
      ...stats,
    };
  }
}
