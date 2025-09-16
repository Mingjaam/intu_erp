'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Filter, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Selection, SelectionQuery } from '@/types/selection';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  selected: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function SelectionsPage() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<SelectionQuery>({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);

  const fetchSelections = useCallback(async () => {
    try {
      const response = await apiClient.get<{ selections: Selection[]; total: number }>(
        API_ENDPOINTS.SELECTIONS.LIST,
        query as Record<string, unknown>
      );
      const data = response.data || response;
      setSelections(data.selections || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('선정 목록 조회 오류:', error);
      toast.error('선정 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchSelections();
  }, [fetchSelections]);

  const handleStatusFilter = (status: string) => {
    setQuery(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status as 'pending' | 'selected' | 'rejected',
      page: 1,
    }));
  };

  const handleSearch = () => {
    // 검색 기능은 백엔드에서 지원하지 않으므로 클라이언트에서 필터링
    // 실제로는 백엔드 API에 search 파라미터를 추가해야 함
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">선정 관리</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              필터
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="신청자명으로 검색..."
                  onChange={handleSearch}
                />
              </div>
              <Select onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="상태별 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                  <SelectItem value="selected">선정</SelectItem>
                  <SelectItem value="rejected">탈락</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {selections.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">선정 내역이 없습니다</h3>
                <p className="text-gray-600">아직 선정된 신청서가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            selections.map((selection) => (
              <Card key={selection.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{selection.application.program.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        신청자: {selection.application.applicant.name}
                      </p>
                    </div>
                    <Badge className={statusColors[selection.selected ? 'selected' : 'rejected']}>
                      {selection.selected ? '선정' : '탈락'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>심사자: {selection.reviewer.name}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        심사일: {new Date(selection.reviewedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {selection.criteria && (
                      <div className="text-sm text-gray-600">
                        <strong>심사 기준:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {Object.entries(selection.criteria).map(([key, value]) => (
                            <li key={key}>{key}: {String(value)}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selection.reason && (
                      <div className="text-sm text-gray-600">
                        <strong>선정/탈락 사유:</strong> {selection.reason}
                      </div>
                    )}

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">신청 정보</h4>
                      <p className="text-sm text-gray-600">
                        신청일: {selection.application.createdAt ? new Date(selection.application.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/selections/${selection.id}`}>
                        상세보기
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/applications/${selection.application.id}`}>
                        신청서 보기
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {total > 10 && (
          <div className="flex justify-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={query.page === 1}
                onClick={() => setQuery(prev => ({ ...prev, page: prev.page! - 1 }))}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={selections.length < query.limit!}
                onClick={() => setQuery(prev => ({ ...prev, page: prev.page! + 1 }))}
              >
                다음
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
