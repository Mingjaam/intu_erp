'use client';

import React, { useState, useEffect } from 'react';
import { Budget, BudgetQuery } from '@/types/budget';
import { BudgetTable } from './budget-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Calendar, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetPageProps {
  organizationId: string;
  organizationName: string;
}

export function BudgetPage({ organizationId, organizationName }: BudgetPageProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    fetchBudgets();
  }, [organizationId, selectedYear, selectedMonth]);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        organizationId,
        year: selectedYear.toString(),
        month: selectedMonth.toString(),
      });

      const response = await fetch(`/api/budgets?${query}`);
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      } else {
        throw new Error('예산 데이터를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '예산 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetChange = (updatedBudgets: Budget[]) => {
    setBudgets(updatedBudgets);
  };

  const handleExportExcel = async () => {
    try {
      const response = await fetch(`/api/budgets/export?organizationId=${organizationId}&year=${selectedYear}&month=${selectedMonth}`, {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${organizationName}_${selectedYear}년_${selectedMonth}월_예산현황.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('엑셀 파일이 다운로드되었습니다.');
      } else {
        throw new Error('엑셀 파일 다운로드에 실패했습니다.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '엑셀 파일 다운로드에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">예산 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{organizationName}</h1>
            <p className="text-gray-600">사업 진행비 현황 관리</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={handleExportExcel} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            엑셀 다운로드
          </Button>
        </div>
      </div>

      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            기간 선택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">년도:</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}년
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">월:</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {month}월
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 예산 테이블 */}
      <BudgetTable
        organizationId={organizationId}
        year={selectedYear}
        month={selectedMonth}
        budgets={budgets}
        onBudgetChange={handleBudgetChange}
      />
    </div>
  );
}
