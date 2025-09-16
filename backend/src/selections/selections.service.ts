import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Selection } from '@/database/entities/selection.entity';
import { Application, ApplicationStatus } from '@/database/entities/application.entity';
import { User, UserRole } from '@/database/entities/user.entity';
import { CreateSelectionDto, UpdateSelectionDto, SelectionQueryDto } from './dto/selection.dto';

@Injectable()
export class SelectionsService {
  constructor(
    @InjectRepository(Selection)
    private selectionRepository: Repository<Selection>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createSelectionDto: CreateSelectionDto, user: User): Promise<Selection> {
    const { applicationId, selected, reason, criteria } = createSelectionDto;

    // 신청서 존재 확인
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['program', 'applicant'],
    });

    if (!application) {
      throw new NotFoundException('신청서를 찾을 수 없습니다.');
    }

    // 이미 선정 처리된 신청서인지 확인
    const existingSelection = await this.selectionRepository.findOne({
      where: { applicationId },
    });

    if (existingSelection) {
      throw new ConflictException('이미 선정 처리된 신청서입니다.');
    }

    // 권한 확인: 심사자, 관리자, 운영자만 선정 처리 가능
    if (
      user.role !== UserRole.REVIEWER &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.OPERATOR
    ) {
      throw new ForbiddenException('선정 처리 권한이 없습니다.');
    }

    const selection = this.selectionRepository.create({
      applicationId,
      selected,
      reason,
      criteria,
      reviewerId: user.id,
      reviewedAt: new Date(),
    });

    const savedSelection = await this.selectionRepository.save(selection);

    // 신청서 상태 업데이트
    application.status = selected ? ApplicationStatus.SELECTED : ApplicationStatus.REJECTED;
    await this.applicationRepository.save(application);

    return await this.selectionRepository.findOne({
      where: { id: savedSelection.id },
      relations: ['application', 'application.program', 'application.applicant', 'reviewer'],
    });
  }

  async findAll(query: SelectionQueryDto, user: User): Promise<{ selections: Selection[]; total: number }> {
    const { programId, reviewerId, selected, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.selectionRepository
      .createQueryBuilder('selection')
      .leftJoinAndSelect('selection.application', 'application')
      .leftJoinAndSelect('application.program', 'program')
      .leftJoinAndSelect('application.applicant', 'applicant')
      .leftJoinAndSelect('applicant.organization', 'organization')
      .leftJoinAndSelect('selection.reviewer', 'reviewer');

    if (programId) {
      queryBuilder.andWhere('application.programId = :programId', { programId });
    }

    if (reviewerId) {
      queryBuilder.andWhere('selection.reviewerId = :reviewerId', { reviewerId });
    }

    if (selected !== undefined) {
      queryBuilder.andWhere('selection.selected = :selected', { selected });
    }

    const [selections, total] = await queryBuilder
      .orderBy('selection.reviewedAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { selections, total };
  }

  async findOne(id: string, user: User): Promise<Selection> {
    const selection = await this.selectionRepository.findOne({
      where: { id },
      relations: ['application', 'application.program', 'application.applicant', 'application.applicant.organization', 'reviewer'],
    });

    if (!selection) {
      throw new NotFoundException('선정 정보를 찾을 수 없습니다.');
    }

    // 권한 확인: 신청자 본인, 심사자, 관리자, 운영자만 조회 가능
    if (
      user.role === UserRole.APPLICANT &&
      selection.application.applicantId !== user.id
    ) {
      throw new ForbiddenException('접근 권한이 없습니다.');
    }

    return selection;
  }

  async update(id: string, updateSelectionDto: UpdateSelectionDto, user: User): Promise<Selection> {
    const selection = await this.findOne(id, user);

    // 권한 확인: 심사자, 관리자, 운영자만 수정 가능
    if (
      user.role !== UserRole.REVIEWER &&
      user.role !== UserRole.ADMIN &&
      user.role !== UserRole.OPERATOR
    ) {
      throw new ForbiddenException('수정 권한이 없습니다.');
    }

    const { selected, reason, criteria } = updateSelectionDto;

    // 선정 상태가 변경된 경우 신청서 상태도 업데이트
    if (selected !== undefined && selected !== selection.selected) {
      const application = await this.applicationRepository.findOne({
        where: { id: selection.applicationId },
      });

      if (application) {
        application.status = selected ? ApplicationStatus.SELECTED : ApplicationStatus.REJECTED;
        await this.applicationRepository.save(application);
      }
    }

    Object.assign(selection, { reason, criteria });
    if (selected !== undefined) {
      selection.selected = selected;
    }

    return await this.selectionRepository.save(selection);
  }

  async getSelectionStats(programId: string, user: User): Promise<any> {
    // 권한 확인
    if (user.role === UserRole.APPLICANT) {
      throw new ForbiddenException('통계 조회 권한이 없습니다.');
    }

    const stats = await this.selectionRepository
      .createQueryBuilder('selection')
      .leftJoin('selection.application', 'application')
      .where('application.programId = :programId', { programId })
      .select([
        'COUNT(selection.id) as totalSelections',
        'COUNT(CASE WHEN selection.selected = true THEN 1 END) as selectedCount',
        'COUNT(CASE WHEN selection.selected = false THEN 1 END) as rejectedCount',
        'AVG(CASE WHEN selection.criteria->>\'score\' IS NOT NULL THEN (selection.criteria->>\'score\')::numeric END) as averageScore',
      ])
      .getRawOne();

    return {
      programId,
      ...stats,
    };
  }
}
