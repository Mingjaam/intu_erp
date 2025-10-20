'use client';

import React, { useState } from 'react';
import { BudgetExpense } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {year}년 {month}월 사업진행비 내역
          </CardTitle>
          <Button onClick={handleAddExpense}>
            <Plus className="w-4 h-4 mr-2" />
            행 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">사용일자</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">지출일자</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">지급처</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border border-gray-200">공급가액</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border border-gray-200">부가가치세</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border border-gray-200">집행금액</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">세부 내용</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">지출구분</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border border-gray-200">작업</th>
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
      </CardContent>
    </Card>
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
        <td className="px-4 py-2 border border-gray-200">
          <Input
            type="date"
            value={editData.usageDate || ''}
            onChange={(e) => setEditData({ ...editData, usageDate: e.target.value })}
            placeholder="사용일자"
            className="w-full"
          />
        </td>
        <td className="px-4 py-2 border border-gray-200">
          <Input
            type="date"
            value={editData.paymentDate || ''}
            onChange={(e) => setEditData({ ...editData, paymentDate: e.target.value })}
            placeholder="지출일자"
            className="w-full"
          />
        </td>
        <td className="px-4 py-2 border border-gray-200">
          <Input
            value={editData.vendor || ''}
            onChange={(e) => setEditData({ ...editData, vendor: e.target.value })}
            placeholder="지급처"
            className="w-full"
          />
        </td>
        <td className="px-4 py-2 border border-gray-200">
          <Input
            type="number"
            value={editData.supplyAmount || ''}
            onChange={(e) => setEditData({ ...editData, supplyAmount: Number(e.target.value) })}
            placeholder="0"
            className="w-full"
          />
        </td>
        <td className="px-4 py-2 border border-gray-200">
          <Input
            type="number"
            value={editData.vatAmount || ''}
            onChange={(e) => setEditData({ ...editData, vatAmount: Number(e.target.value) })}
            placeholder="0"
            className="w-full"
          />
        </td>
        <td className="px-4 py-2 border border-gray-200">
          <Input
            type="number"
            value={editData.executionAmount || ''}
            onChange={(e) => setEditData({ ...editData, executionAmount: Number(e.target.value) })}
            placeholder="0"
            className="w-full"
          />
        </td>
        <td className="px-4 py-2 border border-gray-200">
          <Input
            value={editData.details || ''}
            onChange={(e) => setEditData({ ...editData, details: e.target.value })}
            placeholder="세부 내용"
            className="w-full"
          />
        </td>
        <td className="px-4 py-2 border border-gray-200">
          <Select
            value={editData.expenseType}
            onValueChange={(value) => setEditData({ ...editData, expenseType: value })}
          >
            <SelectTrigger className="w-full">
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
        <td className="px-4 py-2 text-center border border-gray-200">
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
      <td className="px-4 py-2 text-sm border border-gray-200">{expense.usageDate || '-'}</td>
      <td className="px-4 py-2 text-sm border border-gray-200">{expense.paymentDate || '-'}</td>
      <td className="px-4 py-2 text-sm font-medium border border-gray-200">{expense.vendor || '-'}</td>
      <td className="px-4 py-2 text-sm text-right border border-gray-200">{formatCurrency(expense.supplyAmount || 0)}</td>
      <td className="px-4 py-2 text-sm text-right border border-gray-200">{formatCurrency(expense.vatAmount || 0)}</td>
      <td className="px-4 py-2 text-sm text-right font-medium border border-gray-200">
        {formatCurrency(expense.executionAmount || 0)}
      </td>
      <td className="px-4 py-2 text-sm text-gray-600 border border-gray-200">{expense.details || '-'}</td>
      <td className="px-4 py-2 text-sm border border-gray-200">{expense.expenseType || '-'}</td>
      <td className="px-4 py-2 text-center border border-gray-200">
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