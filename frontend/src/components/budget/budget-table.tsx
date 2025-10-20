'use client';

import React, { useState } from 'react';
import { BudgetExpense } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Save, X, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetTableProps {
  organizationId: string;
  year: number;
  month: number;
  expenses: BudgetExpense[];
  onExpenseChange: (expenses: BudgetExpense[]) => void;
}

const EXPENSE_TYPES = [
  '인건비',
  '운영비',
  '장비비',
  '재료비',
  '기타'
];

export function BudgetTable({ organizationId, year, month, expenses, onExpenseChange }: BudgetTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddExpense = async () => {
    try {
      const newId = Date.now().toString();
      const expenseData: BudgetExpense = {
        id: newId,
        organizationId,
        year,
        month,
        usageDate: '',
        paymentDate: '',
        vendor: '',
        supplyAmount: 0,
        vatAmount: 0,
        executionAmount: 0,
        details: '',
        expenseType: '인건비',
      };

      // 빈 행 추가
      onExpenseChange([...expenses, expenseData]);
      
      // 바로 편집 모드로 설정
      setEditingId(newId);
      
      toast.success('새 행이 추가되었습니다. 편집하세요.');
    } catch {
      toast.error('사업진행비 항목 추가에 실패했습니다.');
    }
  };

  const handleUpdateExpense = async (id: string, updates: Partial<BudgetExpense>) => {
    setEditingId(null);
    
    try {
      onExpenseChange(expenses.map(expense => 
        expense.id === id ? { ...expense, ...updates } : expense
      ));
      toast.success('사업진행비 항목이 수정되었습니다.');
    } catch {
      toast.error('사업진행비 항목 수정에 실패했습니다.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('이 사업진행비 항목을 삭제하시겠습니까?')) return;

    try {
      onExpenseChange(expenses.filter(expense => expense.id !== id));
      toast.success('사업진행비 항목이 삭제되었습니다.');
    } catch {
      toast.error('사업진행비 항목 삭제에 실패했습니다.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const totalExecution = expenses.reduce((sum, expense) => sum + (expense.executionAmount || 0), 0);

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {year}년 {month}월 사업진행비 현황
        </h3>
        <div className="text-sm text-gray-600">
          총 집행금액: {formatCurrency(totalExecution)}
        </div>
      </div>

      {/* 추가 버튼 */}
      <div className="flex justify-end">
        <Button onClick={handleAddExpense}>
          <Plus className="w-4 h-4 mr-2" />
          행 추가
        </Button>
      </div>

      {/* 사업진행비 테이블 */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">사용일자</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">지출일자</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">지급처</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">공급가액</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">부가가치세</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">집행금액</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">세부 내용</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">지출구분</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                isEditing={editingId === expense.id}
                onEdit={() => setEditingId(expense.id)}
                onSave={(updates) => handleUpdateExpense(expense.id, updates)}
                onCancel={() => setEditingId(null)}
                onDelete={() => handleDeleteExpense(expense.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ExpenseRowProps {
  expense: BudgetExpense;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<BudgetExpense>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function ExpenseRow({ expense, isEditing, onEdit, onSave, onCancel, onDelete }: ExpenseRowProps) {
  const [editData, setEditData] = useState<Partial<BudgetExpense>>({
    usageDate: expense.usageDate,
    paymentDate: expense.paymentDate,
    vendor: expense.vendor,
    supplyAmount: expense.supplyAmount,
    vatAmount: expense.vatAmount,
    executionAmount: expense.executionAmount,
    details: expense.details,
    expenseType: expense.expenseType,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const handleSave = () => {
    onSave(editData);
  };

  if (isEditing) {
    return (
      <tr className="bg-blue-50">
        <td className="px-4 py-3">
          <Input
            type="date"
            value={editData.usageDate || ''}
            onChange={(e) => setEditData({ ...editData, usageDate: e.target.value })}
            placeholder="사용일자"
          />
        </td>
        <td className="px-4 py-3">
          <Input
            type="date"
            value={editData.paymentDate || ''}
            onChange={(e) => setEditData({ ...editData, paymentDate: e.target.value })}
            placeholder="지출일자"
          />
        </td>
        <td className="px-4 py-3">
          <Input
            value={editData.vendor || ''}
            onChange={(e) => setEditData({ ...editData, vendor: e.target.value })}
            placeholder="지급처"
          />
        </td>
        <td className="px-4 py-3">
          <Input
            type="number"
            value={editData.supplyAmount || ''}
            onChange={(e) => setEditData({ ...editData, supplyAmount: Number(e.target.value) })}
            placeholder="0"
          />
        </td>
        <td className="px-4 py-3">
          <Input
            type="number"
            value={editData.vatAmount || ''}
            onChange={(e) => setEditData({ ...editData, vatAmount: Number(e.target.value) })}
            placeholder="0"
          />
        </td>
        <td className="px-4 py-3">
          <Input
            type="number"
            value={editData.executionAmount || ''}
            onChange={(e) => setEditData({ ...editData, executionAmount: Number(e.target.value) })}
            placeholder="0"
          />
        </td>
        <td className="px-4 py-3">
          <Input
            value={editData.details || ''}
            onChange={(e) => setEditData({ ...editData, details: e.target.value })}
            placeholder="세부 내용"
          />
        </td>
        <td className="px-4 py-3">
          <Select
            value={editData.expenseType}
            onValueChange={(value) => setEditData({ ...editData, expenseType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Save className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">{expense.usageDate || '-'}</td>
      <td className="px-4 py-3 text-sm">{expense.paymentDate || '-'}</td>
      <td className="px-4 py-3 text-sm font-medium">{expense.vendor || '-'}</td>
      <td className="px-4 py-3 text-sm text-right">{formatCurrency(expense.supplyAmount || 0)}</td>
      <td className="px-4 py-3 text-sm text-right">{formatCurrency(expense.vatAmount || 0)}</td>
      <td className="px-4 py-3 text-sm text-right font-medium">
        {formatCurrency(expense.executionAmount || 0)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{expense.details || '-'}</td>
      <td className="px-4 py-3 text-sm">{expense.expenseType || '-'}</td>
      <td className="px-4 py-3 text-center">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}