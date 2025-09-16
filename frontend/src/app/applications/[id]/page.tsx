'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Application } from '@/types/application';

const statusLabels: Record<string, string> = {
  submitted: '제출됨',
  under_review: '심사중',
  selected: '선정됨',
  rejected: '불합격',
  withdrawn: '철회됨',
};

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  selected: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  withdrawn: 'bg-gray-100 text-gray-800',
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applicationId = params.id as string;

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await apiClient.get<Application>(API_ENDPOINTS.APPLICATIONS.DETAIL(applicationId));
        const data = response.data || response;
        setApplication(data);
      } catch (error) {
        console.error('신청서 조회 오류:', error);
        toast.error('신청서 정보를 불러오는데 실패했습니다.');
        router.push('/applications');
      } finally {
        setIsLoading(false);
      }
    };

    if (applicationId) {
      fetchApplication();
    }
  }, [applicationId, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">신청서를 찾을 수 없습니다</h1>
          <Button asChild>
            <Link href="/applications">신청 목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  const renderFormData = (data: Record<string, unknown>) => {
    return Object.entries(data).map(([key, value]) => {
      if (key === 'applicantInfo') return null; // 신청자 정보는 별도로 표시
      
      return (
        <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
          <span className="font-medium text-gray-700">{key}:</span>
          <span className="text-gray-900">
            {Array.isArray(value) ? value.join(', ') : String(value)}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/applications">
              <ArrowLeft className="h-4 w-4 mr-2" />
              신청 목록으로
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">신청서 상세</h1>
        </div>
        <p className="text-gray-600">{application.program.title} 신청서 정보입니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 프로그램 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>프로그램 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{application.program.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={statusColors[application.status]}>
                    {statusLabels[application.status]}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    신청일: {new Date(application.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
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

              {application.program.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">프로그램 설명</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{application.program.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 신청서 내용 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                신청서 내용
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {renderFormData(application.payload)}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* 신청자 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>신청자 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">이름</span>
                <span className="font-medium">{application.applicant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">이메일</span>
                <span className="font-medium">{application.applicant.email}</span>
              </div>
              {application.applicant.phone && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">전화번호</span>
                  <span className="font-medium">{application.applicant.phone}</span>
                </div>
              )}
              {application.applicant.organization && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">소속</span>
                  <span className="font-medium">{application.applicant.organization.name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 상태 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>신청 상태</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">현재 상태</span>
                <Badge className={statusColors[application.status]}>
                  {statusLabels[application.status]}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">신청일</span>
                <span className="font-medium">
                  {new Date(application.createdAt).toLocaleDateString()}
                </span>
              </div>
              {application.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">최종 수정일</span>
                  <span className="font-medium">
                    {new Date(application.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href={`/programs/${application.program.id}`}>
                    프로그램 상세보기
                  </Link>
                </Button>
                {application.status === 'submitted' && (
                  <Button variant="outline" className="w-full">
                    신청 철회
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
