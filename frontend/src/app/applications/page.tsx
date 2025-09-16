'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, Users, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Application } from '@/types/application';

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

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await apiClient.get<{ applications: Application[]; total: number }>(
          API_ENDPOINTS.APPLICATIONS.LIST
        );
        const data = response.data || response;
        setApplications(data.applications || []);
      } catch (error) {
        console.error('신청 목록 조회 오류:', error);
        toast.error('신청 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchApplications();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/programs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              프로그램 목록으로
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">내 신청 목록</h1>
        </div>
        <p className="text-gray-600">제출한 프로그램 신청서들을 확인할 수 있습니다.</p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">신청한 프로그램이 없습니다</h3>
              <p className="text-gray-600 mb-4">관심 있는 프로그램에 신청해보세요.</p>
              <Button asChild>
                <Link href="/programs">프로그램 둘러보기</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{application.program.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={statusColors[application.status]}>
                        {statusLabels[application.status]}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        신청일: {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/applications/${application.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      상세보기
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>주최: {application.program.organizer.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      프로그램 기간: {new Date(application.program.programStart).toLocaleDateString()} -{' '}
                      {new Date(application.program.programEnd).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {application.program.description && (
                  <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                    {application.program.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}