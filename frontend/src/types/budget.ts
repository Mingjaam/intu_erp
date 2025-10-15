export enum BudgetCategory {
  PERSONNEL = 'personnel',
  OPERATION = 'operation',
  EQUIPMENT = 'equipment',
  MATERIAL = 'material',
  OTHER = 'other',
}

export interface Budget {
  id: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    type: string;
  };
  year: number;
  month: number;
  category: BudgetCategory;
  item: string;
  description?: string;
  plannedAmount: number;
  actualAmount: number;
  remainingAmount: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetRequest {
  organizationId: string;
  year: number;
  month: number;
  category: BudgetCategory;
  item: string;
  description?: string;
  plannedAmount: number;
  actualAmount?: number;
  notes?: string;
}

export interface UpdateBudgetRequest {
  organizationId?: string;
  year?: number;
  month?: number;
  category?: BudgetCategory;
  item?: string;
  description?: string;
  plannedAmount?: number;
  actualAmount?: number;
  notes?: string;
}

export interface BudgetQuery {
  organizationId?: string;
  year?: number;
  month?: number;
}

export interface BudgetSummary {
  totalPlanned: number;
  totalActual: number;
  totalRemaining: number;
  byCategory: {
    [key in BudgetCategory]: {
      planned: number;
      actual: number;
      remaining: number;
    };
  };
}

export const BUDGET_CATEGORY_LABELS: Record<BudgetCategory, string> = {
  [BudgetCategory.PERSONNEL]: '인건비',
  [BudgetCategory.OPERATION]: '운영비',
  [BudgetCategory.EQUIPMENT]: '장비비',
  [BudgetCategory.MATERIAL]: '재료비',
  [BudgetCategory.OTHER]: '기타',
};
