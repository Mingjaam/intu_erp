export interface BudgetExpense {
  id: string;
  organizationId: string;
  year: number;
  month: number;
  usageDate: string;
  paymentDate: string;
  vendor: string;
  supplyAmount: number;
  vatAmount: number;
  executionAmount: number;
  details: string;
  expenseType: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBudgetExpenseRequest {
  organizationId: string;
  year: number;
  month: number;
  usageDate: string;
  paymentDate: string;
  vendor: string;
  supplyAmount: number;
  vatAmount: number;
  executionAmount: number;
  details: string;
  expenseType: string;
}

export interface UpdateBudgetExpenseRequest {
  usageDate?: string;
  paymentDate?: string;
  vendor?: string;
  supplyAmount?: number;
  vatAmount?: number;
  executionAmount?: number;
  details?: string;
  expenseType?: string;
}

export interface BudgetExpenseQuery {
  organizationId?: string;
  year?: number;
  month?: number;
}

export const EXPENSE_TYPES = [
  '인건비',
  '운영비',
  '장비비',
  '재료비',
  '기타'
] as const;

export type ExpenseType = typeof EXPENSE_TYPES[number];