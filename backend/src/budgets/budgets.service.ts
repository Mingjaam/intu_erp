import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from '../database/entities/budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetQueryDto } from './dto/budget-query.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  async create(createBudgetDto: CreateBudgetDto): Promise<Budget> {
    const budget = this.budgetRepository.create(createBudgetDto);
    
    // Calculate remaining amount
    budget.remainingAmount = budget.plannedAmount - (budget.actualAmount || 0);
    
    return this.budgetRepository.save(budget);
  }

  async findAll(query: BudgetQueryDto): Promise<Budget[]> {
    const queryBuilder = this.budgetRepository
      .createQueryBuilder('budget')
      .leftJoinAndSelect('budget.organization', 'organization')
      .where('budget.isActive = :isActive', { isActive: true });

    if (query.organizationId) {
      queryBuilder.andWhere('budget.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }

    if (query.year) {
      queryBuilder.andWhere('budget.year = :year', { year: query.year });
    }

    if (query.month) {
      queryBuilder.andWhere('budget.month = :month', { month: query.month });
    }

    return queryBuilder
      .orderBy('budget.year', 'DESC')
      .addOrderBy('budget.month', 'DESC')
      .addOrderBy('budget.category', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<Budget> {
    const budget = await this.budgetRepository.findOne({
      where: { id, isActive: true },
      relations: ['organization'],
    });

    if (!budget) {
      throw new NotFoundException('예산 항목을 찾을 수 없습니다.');
    }

    return budget;
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    const budget = await this.findOne(id);
    
    Object.assign(budget, updateBudgetDto);
    
    // Recalculate remaining amount
    budget.remainingAmount = budget.plannedAmount - budget.actualAmount;
    
    return this.budgetRepository.save(budget);
  }

  async remove(id: string): Promise<void> {
    const budget = await this.findOne(id);
    budget.isActive = false;
    await this.budgetRepository.save(budget);
  }

  async getMonthlySummary(organizationId: string, year: number, month: number) {
    const budgets = await this.budgetRepository
      .createQueryBuilder('budget')
      .where('budget.organizationId = :organizationId', { organizationId })
      .andWhere('budget.year = :year', { year })
      .andWhere('budget.month = :month', { month })
      .andWhere('budget.isActive = :isActive', { isActive: true })
      .getMany();

    const summary = {
      totalPlanned: 0,
      totalActual: 0,
      totalRemaining: 0,
      byCategory: {
        personnel: { planned: 0, actual: 0, remaining: 0 },
        operation: { planned: 0, actual: 0, remaining: 0 },
        equipment: { planned: 0, actual: 0, remaining: 0 },
        material: { planned: 0, actual: 0, remaining: 0 },
        other: { planned: 0, actual: 0, remaining: 0 },
      },
    };

    budgets.forEach(budget => {
      summary.totalPlanned += Number(budget.plannedAmount);
      summary.totalActual += Number(budget.actualAmount);
      summary.totalRemaining += Number(budget.remainingAmount);

      if (summary.byCategory[budget.category]) {
        summary.byCategory[budget.category].planned += Number(budget.plannedAmount);
        summary.byCategory[budget.category].actual += Number(budget.actualAmount);
        summary.byCategory[budget.category].remaining += Number(budget.remainingAmount);
      }
    });

    return summary;
  }
}
