'use client';

import React, { useState, useEffect } from 'react';
import { Budget, BudgetCategory, CreateBudgetRequest, UpdateBudgetRequest, BUDGET_CATEGORY_LABELS } from '@/types/budget';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetTableProps {
  organizationId: string;
  year: number;
  month: number;
  budgets: Budget[];
  onBudgetChange: (budgets: Budget[]) => void;
}

export function BudgetTable({ organizationId, year, month, budgets, onBudgetChange }: BudgetTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newBudget, setNewBudget] = useState<Partial<CreateBudgetRequest>>({
    organizationId,
    year,
    month,
    category: BudgetCategory.PERSONNEL,
    plannedAmount: 0,
    actualAmount: 0,
  });

  const handleAddBudget = async () => {
    if (!newBudget.item || !newBudget.plannedAmount) {
      toast.error('항목명과 계획 금액을 입력해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBudget),
      });

      if (response.ok) {
        const createdBudget = await response.json();
        onBudgetChange([...budgets, createdBudget]);
        setNewBudget({
          organizationId,
          year,
          month,
          category: BudgetCategory.PERSONNEL,
          plannedAmount: 0,
          actualAmount: 0,
        });
        toast.success('예산 항목이 추가되었습니다.');
      } else {
        throw new Error('예산 항목 추가에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '예산 항목 추가에 실패했습니다.');
    }
  };

  const handleUpdateBudget = async (id: string, updates: UpdateBudgetRequest) => {
    setEditingId(null);
    
    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedBudget = await response.json();
        onBudgetChange(budgets.map(b => b.id === id ? updatedBudget : b));
        toast.success('예산 항목이 수정되었습니다.');
      } else {
        throw new Error('예산 항목 수정에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '예산 항목 수정에 실패했습니다.');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('이 예산 항목을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onBudgetChange(budgets.filter(b => b.id !== id));
        toast.success('예산 항목이 삭제되었습니다.');
      } else {
        throw new Error('예산 항목 삭제에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '예산 항목 삭제에 실패했습니다.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  };

  const totalPlanned = budgets.reduce((sum, budget) => sum + budget.plannedAmount, 0);
  const totalActual = budgets.reduce((sum, budget) => sum + budget.actualAmount, 0);
  const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remainingAmount, 0);

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {year}년 {month}월 예산 현황
        </h3>
        <div className="text-sm text-gray-600">
          계획: {formatCurrency(totalPlanned)} | 
          집행: {formatCurrency(totalActual)} | 
          잔액: {formatCurrency(totalRemaining)}
        </div>
      </div>

      {/* 새 항목 추가 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-3">새 예산 항목 추가</h4>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <Label htmlFor="category">분류</Label>
            <Select
              value={newBudget.category}
              onValueChange={(value) => setNewBudget({ ...newBudget, category: value as BudgetCategory })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BUDGET_CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="item">항목명</Label>
            <Input
              id="item"
              value={newBudget.item || ''}
              onChange={(e) => setNewBudget({ ...newBudget, item: e.target.value })}
              placeholder="항목명 입력"
            />
          </div>
          
          <div>
            <Label htmlFor="plannedAmount">계획 금액</Label>
            <Input
              id="plannedAmount"
              type="number"
              value={newBudget.plannedAmount || ''}
              onChange={(e) => setNewBudget({ ...newBudget, plannedAmount: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          
          <div>
            <Label htmlFor="actualAmount">집행 금액</Label>
            <Input
              id="actualAmount"
              type="number"
              value={newBudget.actualAmount || ''}
              onChange={(e) => setNewBudget({ ...newBudget, actualAmount: Number(e.target.value) })}
              placeholder="0"
            />
          </div>
          
          <div>
            <Label htmlFor="description">설명</Label>
            <Input
              id="description"
              value={newBudget.description || ''}
              onChange={(e) => setNewBudget({ ...newBudget, description: e.target.value })}
              placeholder="설명 (선택)"
            />
          </div>
          
          <div className="flex items-end">
            <Button onClick={handleAddBudget} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              추가
            </Button>
          </div>
        </div>
      </div>

      {/* 예산 테이블 */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">분류</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">항목명</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">계획 금액</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">집행 금액</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">잔액</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">설명</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">작업</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {budgets.map((budget) => (
              <BudgetRow
                key={budget.id}
                budget={budget}
                isEditing={editingId === budget.id}
                onEdit={() => setEditingId(budget.id)}
                onSave={(updates) => handleUpdateBudget(budget.id, updates)}
                onCancel={() => setEditingId(null)}
                onDelete={() => handleDeleteBudget(budget.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface BudgetRowProps {
  budget: Budget;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: UpdateBudgetRequest) => void;
  onCancel: () => void;
  onDelete: () => void;
}

function BudgetRow({ budget, isEditing, onEdit, onSave, onCancel, onDelete }: BudgetRowProps) {
  const [editData, setEditData] = useState<UpdateBudgetRequest>({
    category: budget.category,
    item: budget.item,
    plannedAmount: budget.plannedAmount,
    actualAmount: budget.actualAmount,
    description: budget.description,
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
          <Select
            value={editData.category}
            onValueChange={(value) => setEditData({ ...editData, category: value as BudgetCategory })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BUDGET_CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </td>
        <td className="px-4 py-3">
          <Input
            value={editData.item || ''}
            onChange={(e) => setEditData({ ...editData, item: e.target.value })}
          />
        </td>
        <td className="px-4 py-3">
          <Input
            type="number"
            value={editData.plannedAmount || ''}
            onChange={(e) => setEditData({ ...editData, plannedAmount: Number(e.target.value) })}
          />
        </td>
        <td className="px-4 py-3">
          <Input
            type="number"
            value={editData.actualAmount || ''}
            onChange={(e) => setEditData({ ...editData, actualAmount: Number(e.target.value) })}
          />
        </td>
        <td className="px-4 py-3 text-right">
          {formatCurrency((editData.plannedAmount || 0) - (editData.actualAmount || 0))}
        </td>
        <td className="px-4 py-3">
          <Input
            value={editData.description || ''}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          />
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
      <td className="px-4 py-3 text-sm">
        {BUDGET_CATEGORY_LABELS[budget.category]}
      </td>
      <td className="px-4 py-3 text-sm font-medium">{budget.item}</td>
      <td className="px-4 py-3 text-sm text-right">{formatCurrency(budget.plannedAmount)}</td>
      <td className="px-4 py-3 text-sm text-right">{formatCurrency(budget.actualAmount)}</td>
      <td className="px-4 py-3 text-sm text-right font-medium">
        <span className={budget.remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
          {formatCurrency(budget.remainingAmount)}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{budget.description || '-'}</td>
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
