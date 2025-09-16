'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar, Clock, Filter, User, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Visit, VisitQuery } from '@/types/visit';

const statusLabels: Record<string, string> = {
  scheduled: '예정',
  completed: '완료',
  cancelled: '취소',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<VisitQuery>({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);

  const fetchVisits = useCallback(async () => {
    try {
      const response = await apiClient.get<{ visits: Visit[]; total: number }>(
        API_ENDPOINTS.VISITS.LIST,
        query as Record<string, unknown>
      );
      const data = response.data || response;
      setVisits(data.visits || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('방문 목록 조회 오류:', error);
      toast.error('방문 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const handleStatusFilter = (status: string) => {
    setQuery(prev => ({
      ...prev,
      status: status === 'all' ? undefined : status as 'scheduled' | 'completed' | 'cancelled',
      page: 1,
    }));
  };

  const handleSearch = () => {
    // 검색 기능은 백엔드에서 지원하지 않으므로 클라이언트에서 필터링
    // 실제로는 백엔드 API에 search 파라미터를 추가해야 함
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <h1 className="text-3xl font-bold text-gray-900">방문 관리</h1>
        <Button asChild>
          <Link href="/visits/new">새 방문 등록</Link>
        </Button>
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
                  placeholder="조직명으로 검색..."
                  onChange={handleSearch}
                />
              </div>
              <Select onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="상태별 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="scheduled">예정</SelectItem>
                  <SelectItem value="completed">완료</SelectItem>
                  <SelectItem value="cancelled">취소</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {visits.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">방문 내역이 없습니다</h3>
                <p className="text-gray-600">아직 등록된 방문이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            visits.map((visit) => (
              <Card key={visit.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{visit.organization.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        프로그램: {visit.program.title}
                      </p>
                    </div>
                    <Badge className={statusColors[visit.status]}>
                      {statusLabels[visit.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        예정일: {formatDateTime(visit.scheduledAt)}
                      </span>
                    </div>
                    
                    {visit.performedAt && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span>
                          완료일: {formatDateTime(visit.performedAt)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>방문자: {visit.visitor.name}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>주소: {visit.organization.address}</span>
                    </div>
                    
                    {visit.notes && (
                      <div className="text-sm text-gray-600">
                        <strong>방문 메모:</strong> {visit.notes}
                      </div>
                    )}

                    {visit.outcome && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-1">방문 결과</h4>
                        <div className="text-sm text-gray-600">
                          {Object.entries(visit.outcome).map(([key, value]) => (
                            <div key={key}>
                              <strong>{key}:</strong> {String(value)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/visits/${visit.id}`}>
                        상세보기
                      </Link>
                    </Button>
                    {visit.status === 'scheduled' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // 완료 처리 기능 구현
                            if (confirm('방문을 완료 처리하시겠습니까?')) {
                              // API 호출
                            }
                          }}
                        >
                          완료 처리
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // 취소 기능 구현
                            if (confirm('방문을 취소하시겠습니까?')) {
                              // API 호출
                            }
                          }}
                        >
                          취소
                        </Button>
                      </>
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
                disabled={visits.length < query.limit!}
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
