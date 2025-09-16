'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Filter, Building, Users } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Organization, OrganizationQuery } from '@/types/organization';

const typeLabels: Record<string, string> = {
  company: '기업',
  village: '마을',
  government: '정부기관',
  ngo: '비영리단체',
};

const typeColors: Record<string, string> = {
  company: 'bg-blue-100 text-blue-800',
  village: 'bg-green-100 text-green-800',
  government: 'bg-purple-100 text-purple-800',
  ngo: 'bg-orange-100 text-orange-800',
};

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState<OrganizationQuery>({
    page: 1,
    limit: 10,
  });
  const [total, setTotal] = useState(0);

  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await apiClient.get<{ organizations: Organization[]; total: number }>(
        API_ENDPOINTS.ORGANIZATIONS.LIST,
        query as Record<string, unknown>
      );
      const data = response.data || response;
      setOrganizations(data.organizations || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('조직 목록 조회 오류:', error);
      toast.error('조직 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleTypeFilter = (type: string) => {
    setQuery(prev => ({
      ...prev,
      type: type === 'all' ? undefined : type as 'company' | 'village' | 'institution' | 'ngo',
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
        <h1 className="text-3xl font-bold text-gray-900">조직 관리</h1>
        <Button asChild>
          <Link href="/organizations/new">새 조직 등록</Link>
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
              <Select onValueChange={handleTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="유형별 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="company">기업</SelectItem>
                  <SelectItem value="village">마을</SelectItem>
                  <SelectItem value="government">정부기관</SelectItem>
                  <SelectItem value="ngo">비영리단체</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {organizations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 조직이 없습니다</h3>
                <p className="text-gray-600">새로운 조직을 등록해보세요.</p>
              </CardContent>
            </Card>
          ) : (
            organizations.map((organization) => (
              <Card key={organization.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{organization.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {organization.description}
                      </p>
                    </div>
                    <Badge className={typeColors[organization.type]}>
                      {typeLabels[organization.type]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{organization.address}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{organization.contact}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        등록일: {new Date(organization.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/organizations/${organization.id}`}>
                        상세보기
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/organizations/${organization.id}/edit`}>
                        수정
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
                disabled={organizations.length < query.limit!}
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
