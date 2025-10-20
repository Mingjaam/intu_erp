'use client';

import React, { useState } from 'react';
import { BudgetExpense } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [newExpense, setNewExpense] = useState<Partial<BudgetExpense>>({
    usageDate: '',
    paymentDate: '',
    vendor: '',
    supplyAmount: 0,
    vatAmount: 0,
    executionAmount: 0,
    details: '',
    expenseType: '인건비',
  });

  const handleAddExpense = async () => {
    try {
      const expenseData = {
        ...newExpense,
        organizationId,
        year,
        month,
        id: Date.now().toString(), // 임시 ID
      };

      // 실제 API 호출 대신 로컬 상태 업데이트
      onExpenseChange([...expenses, expenseData as BudgetExpense]);
      
      // 폼 초기화
      setNewExpense({
        usageDate: '',
        paymentDate: '',
        vendor: '',
        supplyAmount: 0,
        vatAmount: 0,
        executionAmount: 0,
        details: '',
        expenseType: '인건비',
      });
      
      toast.success('사업진행비 항목이 추가되었습니다.');
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

      {/* 새 항목 추가 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">새 사업진행비 항목 추가</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label htmlFor="usageDate">사용일자</Label>
            <Input
              id="usageDate"
              type="date"
              value={newExpense.usageDate || ''}
              onChange={(e) => setNewExpense({ ...newExpense, usageDate: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="paymentDate">지출일자</Label>
            <Input
              id="paymentDate"
              type="date"
              value={newExpense.paymentDate || ''}
              onChange={(e) => setNewExpense({ ...newExpense, paymentDate: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="vendor">지급처</Label>
            <Input
              id="vendor"
              value={newExpense.vendor || ''}
              onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
              placeholder="지급처 입력"
            />
          </div>
          
          <div>
            <Label htmlFor="supplyAmount">공급가액</Label>
            <Input
              id="supplyAmount"
              type="number"
              value={newExpense.supplyAmount || ''}
              onChange={(e) => setNewExpense({ ...newExpense, supplyAmount: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          
          <div>
            <Label htmlFor="vatAmount">부가가치세</Label>
            <Input
              id="vatAmount"
              type="number"
              value={newExpense.vatAmount || ''}
              onChange={(e) => setNewExpense({ ...newExpense, vatAmount: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          
          <div>
            <Label htmlFor="executionAmount">집행금액</Label>
            <Input
              id="executionAmount"
              type="number"
              value={newExpense.executionAmount || ''}
              onChange={(e) => setNewExpense({ ...newExpense, executionAmount: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          
          <div>
            <Label htmlFor="details">세부 내용 및 품목</Label>
            <Input
              id="details"
              value={newExpense.details || ''}
              onChange={(e) => setNewExpense({ ...newExpense, details: e.target.value })}
              placeholder="세부 내용 입력"
            />
          </div>
          
          <div>
            <Label htmlFor="expenseType">지출구분</Label>
            <Select
              value={newExpense.expenseType}
              onValueChange={(value) => setNewExpense({ ...newExpense, expenseType: value })}
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
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleAddExpense} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              추가
            </Button>
          </div>
        </div>
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
          />
        </td>
        <td className="px-4 py-3">
          <Input
            type="date"
            value={editData.paymentDate || ''}
            onChange={(e) => setEditData({ ...editData, paymentDate: e.target.value })}
          />
        </td>
        <td className="px-4 py-3">
          <Input
            value={editData.vendor || ''}
            onChange={(e) => setEditData({ ...editData, vendor: e.target.value })}
          />
        </td>
        <td className="px-4 py-3">
          <Input
            type="number"
            value={editData.supplyAmount || ''}
            onChange={(e) => setEditData({ ...editData, supplyAmount: Number(e.target.value) })}
          />
        </td>
        <td className="px-4 py-3">
          <Input
            type="number"
            value={editData.vatAmount || ''}
            onChange={(e) => setEditData({ ...editData, vatAmount: Number(e.target.value) })}
          />
        </td>
        <td className="px-4 py-3">
          <Input
            type="number"
            value={editData.executionAmount || ''}
            onChange={(e) => setEditData({ ...editData, executionAmount: Number(e.target.value) })}
          />
        </td>
        <td className="px-4 py-3">
          <Input
            value={editData.details || ''}
            onChange={(e) => setEditData({ ...editData, details: e.target.value })}
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