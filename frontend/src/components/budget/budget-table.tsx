'use client';

import React, { useState } from 'react';
import { BudgetExpense } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetTableProps {
  organizationId: string;
  year: number;
  month: number;
  expenses: BudgetExpense[];
  onExpenseChange: (expenses: BudgetExpense[]) => void;
}


export function BudgetTable({ organizationId, year, month, expenses, onExpenseChange }: BudgetTableProps) {

  const handleAddExpense = async () => {
    try {
      const newId = Date.now().toString();
      const expenseData: BudgetExpense = {
        id: newId,
        organizationId,
        year,
        month,
        content: '',
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
      
      toast.success('새 행이 추가되었습니다. 더블클릭하여 편집하세요.');
    } catch {
      toast.error('사업진행비 항목 추가에 실패했습니다.');
    }
  };

  const handleUpdateExpense = async (id: string, updates: Partial<BudgetExpense>) => {
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
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">내용</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">사용일자</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">지출일자</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">지급처</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border border-gray-200">공급가액</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border border-gray-200">부가가치세</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border border-gray-200">집행금액</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">세부내용 및 품목</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-200">지출구분</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border border-gray-200">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  onSave={(updates) => handleUpdateExpense(expense.id, updates)}
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
  onSave: (updates: Partial<BudgetExpense>) => void;
  onDelete: () => void;
}

function ExpenseRow({ expense, onSave, onDelete }: ExpenseRowProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const handleDoubleClick = (field: string, currentValue: string | number) => {
    setEditingField(field);
    setEditValue(String(currentValue || ''));
  };

  const handleSave = (field: string) => {
    const updates: Partial<BudgetExpense> = {};
    if (field === 'supplyAmount') {
      updates.supplyAmount = Number(editValue) || 0;
    } else if (field === 'vatAmount') {
      updates.vatAmount = Number(editValue) || 0;
    } else if (field === 'executionAmount') {
      updates.executionAmount = Number(editValue) || 0;
    } else if (field === 'content') {
      updates.content = editValue;
    } else if (field === 'usageDate') {
      updates.usageDate = editValue;
    } else if (field === 'paymentDate') {
      updates.paymentDate = editValue;
    } else if (field === 'vendor') {
      updates.vendor = editValue;
    } else if (field === 'details') {
      updates.details = editValue;
    } else if (field === 'expenseType') {
      updates.expenseType = editValue;
    }
    onSave(updates);
    setEditingField(null);
    setEditValue('');
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      handleSave(field);
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const renderCell = (field: string, value: string | number, type: string = 'text', className: string = '') => {
    if (editingField === field) {
      return (
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleSave(field)}
          onKeyDown={(e) => handleKeyDown(e, field)}
          className={`w-full h-full border-0 p-0 focus:ring-2 focus:ring-blue-500 ${className}`}
          autoFocus
        />
      );
    }

    return (
      <div
        className={`w-full h-full cursor-pointer hover:bg-blue-50 p-1 rounded ${className}`}
        onDoubleClick={() => handleDoubleClick(field, value)}
      >
        {type === 'number' ? formatCurrency(Number(value) || 0) : (value || '-')}
      </div>
    );
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2 text-sm border border-gray-200 min-w-[150px]">
        {renderCell('content', expense.content || '')}
      </td>
      <td className="px-4 py-2 text-sm border border-gray-200 min-w-[120px]">
        {renderCell('usageDate', expense.usageDate || '', 'date')}
      </td>
      <td className="px-4 py-2 text-sm border border-gray-200 min-w-[120px]">
        {renderCell('paymentDate', expense.paymentDate || '', 'date')}
      </td>
      <td className="px-4 py-2 text-sm font-medium border border-gray-200 min-w-[120px]">
        {renderCell('vendor', expense.vendor || '')}
      </td>
      <td className="px-4 py-2 text-sm text-right border border-gray-200 min-w-[100px]">
        {renderCell('supplyAmount', expense.supplyAmount || 0, 'number')}
      </td>
      <td className="px-4 py-2 text-sm text-right border border-gray-200 min-w-[100px]">
        {renderCell('vatAmount', expense.vatAmount || 0, 'number')}
      </td>
      <td className="px-4 py-2 text-sm text-right font-medium border border-gray-200 min-w-[100px]">
        {renderCell('executionAmount', expense.executionAmount || 0, 'number')}
      </td>
      <td className="px-4 py-2 text-sm text-gray-600 border border-gray-200 min-w-[200px]">
        {renderCell('details', expense.details || '')}
      </td>
      <td className="px-4 py-2 text-sm border border-gray-200 min-w-[100px]">
        {renderCell('expenseType', expense.expenseType || '')}
      </td>
      <td className="px-4 py-2 text-center border border-gray-200 min-w-[80px]">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}