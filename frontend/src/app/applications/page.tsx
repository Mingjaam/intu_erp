'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, FileText, Filter } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Application, ApplicationQuery } from '@/types/application';

const statusLabels: Record<string, string> = {
  submitted: '제출됨',
  under_review: '심사중',
  selected: '선정됨',
  rejected: '탈락',
  withdrawn: '철회됨',
};

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  selected: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<ApplicationQuery>({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);

  const fetchApplications = useCallback(async () => {
    try {
      const response = await apiClient.get<{ applications: Application[]; total: number }>(
        API_ENDPOINTS.APPLICATIONS.LIST,
        query as Record<string, unknown>
      );
      setApplications(response.data.applications);
      setTotal(response.data.total);
    } catch (error) {
      console.error('신청서 목록 조회 오류:', error);
      toast.error('신청서 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusFilter = (status: string) => {
    setQuery(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status as 'submitted' | 'under_review' | 'selected' | 'rejected' | 'withdrawn',
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
        <h1 className="text-3xl font-bold text-gray-900">내 신청서</h1>
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
                  placeholder="프로그램명으로 검색..."
                  onChange={handleSearch}
                />
              </div>
              <Select onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="상태별 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="submitted">제출됨</SelectItem>
                  <SelectItem value="under_review">심사중</SelectItem>
                  <SelectItem value="selected">선정됨</SelectItem>
                  <SelectItem value="rejected">탈락</SelectItem>
                  <SelectItem value="withdrawn">철회됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">신청서가 없습니다</h3>
                <p className="text-gray-600 mb-4">아직 신청한 프로그램이 없습니다.</p>
                <Button asChild>
                  <Link href="/programs">프로그램 둘러보기</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{application.program.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        신청일: {new Date(application.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={statusColors[application.status]}>
                      {statusLabels[application.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        신청 기간: {new Date(application.program.applyStart).toLocaleDateString()} -{' '}
                        {new Date(application.program.applyEnd).toLocaleDateString()}
                      </span>
                    </div>
                    
                    
                    {application.notes && (
                      <div className="text-sm text-gray-600">
                        심사자 메모: {application.notes}
                      </div>
                    )}

                    {application.selection && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-1">선정 결과</h4>
                        <p className="text-sm text-gray-600">
                          {application.selection.selected ? '선정' : '탈락'}
                          {application.selection.reason && ` - ${application.selection.reason}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          심사자: {application.selection.reviewer.name} | 
                          심사일: {new Date(application.selection.reviewedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/applications/${application.id}`}>
                        상세보기
                      </Link>
                    </Button>
                    {application.status === 'submitted' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // 철회 기능 구현
                          if (confirm('정말로 신청을 철회하시겠습니까?')) {
                            // API 호출
                          }
                        }}
                      >
                        철회
                      </Button>
                    )}
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
                disabled={applications.length < query.limit!}
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
