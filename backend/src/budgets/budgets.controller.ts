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
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { BudgetQueryDto } from './dto/budget-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import * as XLSX from 'xlsx';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.budgetsService.create(createBudgetDto);
  }

  @Get()
  findAll(@Query() query: BudgetQueryDto) {
    return this.budgetsService.findAll(query);
  }

  @Get('summary')
  getMonthlySummary(
    @Query('organizationId') organizationId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.budgetsService.getMonthlySummary(organizationId, year, month);
  }

  @Get('export')
  async exportToExcel(
    @Query('organizationId') organizationId: string,
    @Query('year') year: number,
    @Query('month') month: number,
    @Res() res: Response,
  ) {
    try {
      const budgets = await this.budgetsService.findAll({
        organizationId,
        year,
        month,
      });

      const summary = await this.budgetsService.getMonthlySummary(organizationId, year, month);

      // 엑셀 워크북 생성
      const workbook = XLSX.utils.book_new();

      // 예산 데이터 시트
      const budgetData = budgets.map(budget => ({
        '분류': budget.category,
        '항목명': budget.item,
        '설명': budget.description || '',
        '계획금액': budget.plannedAmount,
        '집행금액': budget.actualAmount,
        '잔액': budget.remainingAmount,
        '비고': budget.notes || '',
      }));

      const budgetSheet = XLSX.utils.json_to_sheet(budgetData);
      XLSX.utils.book_append_sheet(workbook, budgetSheet, '예산현황');

      // 요약 시트
      const summaryData = [
        ['항목', '금액'],
        ['총 계획금액', summary.totalPlanned],
        ['총 집행금액', summary.totalActual],
        ['총 잔액', summary.totalRemaining],
        [''],
        ['분류별 현황', ''],
        ['인건비 계획', summary.byCategory.personnel?.planned || 0],
        ['인건비 집행', summary.byCategory.personnel?.actual || 0],
        ['인건비 잔액', summary.byCategory.personnel?.remaining || 0],
        ['운영비 계획', summary.byCategory.operation?.planned || 0],
        ['운영비 집행', summary.byCategory.operation?.actual || 0],
        ['운영비 잔액', summary.byCategory.operation?.remaining || 0],
        ['장비비 계획', summary.byCategory.equipment?.planned || 0],
        ['장비비 집행', summary.byCategory.equipment?.actual || 0],
        ['장비비 잔액', summary.byCategory.equipment?.remaining || 0],
        ['재료비 계획', summary.byCategory.material?.planned || 0],
        ['재료비 집행', summary.byCategory.material?.actual || 0],
        ['재료비 잔액', summary.byCategory.material?.remaining || 0],
        ['기타 계획', summary.byCategory.other?.planned || 0],
        ['기타 집행', summary.byCategory.other?.actual || 0],
        ['기타 잔액', summary.byCategory.other?.remaining || 0],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, '요약');

      // 엑셀 파일 생성
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // 파일명 설정
      const fileName = `예산현황_${year}년_${month}월.xlsx`;

      // 응답 헤더 설정
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': excelBuffer.length.toString(),
      });

      res.send(excelBuffer);
    } catch (error) {
      res.status(500).json({
        message: '엑셀 파일 생성에 실패했습니다.',
        error: error.message,
      });
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.budgetsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBudgetDto: UpdateBudgetDto) {
    return this.budgetsService.update(id, updateBudgetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.budgetsService.remove(id);
  }
}