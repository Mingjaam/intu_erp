'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Eye, Edit, X, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Application } from '@/types/application';
import { Program } from '@/types/program';
import { Header } from '@/components/layout/header';

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
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  const handleCancelApplication = async (applicationId: string) => {
    if (!confirm('정말로 이 신청을 취소하시겠습니까?')) {
      return;
    }

    setCancellingId(applicationId);
    try {
      await apiClient.patch(API_ENDPOINTS.APPLICATIONS.UPDATE(applicationId), {
        status: 'withdrawn'
      });
      
      // 로컬 상태 업데이트
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'withdrawn' }
            : app
        )
      );
      
      toast.success('신청이 취소되었습니다.');
    } catch (error) {
      console.error('신청 취소 오류:', error);
      toast.error('신청 취소에 실패했습니다.');
    } finally {
      setCancellingId(null);
    }
  };

  const canEdit = (status: string) => {
    return status === 'submitted' || status === 'under_review';
  };

  const canCancel = (status: string) => {
    return status === 'submitted' || status === 'under_review';
  };

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Header />
      <div className="pb-16 md:pb-0">
        <div className="container mx-auto px-6 py-8">
          {/* 히어로 섹션 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
              내 신청 목록
            </h1>
            <p className="text-xl text-gray-600 mb-6">제출한 프로그램 신청서들을 확인하고 관리하세요</p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <span className="text-sm font-medium text-gray-700">총 {applications.length}개의 신청서</span>
              </div>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">신청한 프로그램이 없습니다</h3>
              <p className="text-gray-600 mb-4">관심 있는 프로그램에 신청해보세요.</p>
              <Button asChild>
                <Link href="/programs">프로그램 둘러보기</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {applications.map((application, index) => {
                const gradientColors = [
                  'from-blue-500 to-blue-600',
                  'from-green-500 to-green-600',
                  'from-purple-500 to-purple-600',
                  'from-pink-500 to-pink-600',
                  'from-orange-500 to-orange-600',
                  'from-teal-500 to-teal-600'
                ];
                const gradientColor = gradientColors[index % gradientColors.length];
                
                return (
                  <Card key={application.id} className="group hover:shadow-xl transition-all duration-300 bg-white border-0 overflow-hidden flex flex-col rounded-lg">
                    {/* 이미지 영역 - 세로로 긴 3:4 비율 */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg">
                      {(application.program as Program).imageUrl ? (
                        <div className="relative w-full h-full rounded-t-lg overflow-hidden">
                          {/* 흐림 배경 - 빈 공간 채우기 */}
                          <div 
                            className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-md scale-110 rounded-t-lg"
                            style={{ backgroundImage: `url(${(application.program as Program).imageUrl || ''})` }}
                          />
                          {/* 메인 이미지 - 3:4 비율에 맞춤 */}
                          <Image
                            src={(application.program as Program).imageUrl || ''}
                            alt={application.program.title}
                            fill
                            className="relative z-10 object-contain rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradientColor} flex items-center justify-center rounded-t-lg`}>
                          <div className="text-white text-center">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-80" />
                            <p className="text-sm font-medium">프로그램 이미지</p>
                          </div>
                        </div>
                      )}
                      {/* 상태 배지 */}
                      <div className="absolute top-3 right-3 z-20">
                        <Badge className={`${statusColors[application.status]} px-2 py-1 rounded-full text-xs font-medium shadow-lg border-0`}>
                          {statusLabels[application.status]}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* 정보 영역 - 이미지 아래 */}
                    <div className="p-4 flex flex-col flex-1">
                      {/* 활동 기간 */}
                      <div className="text-sm text-gray-600 mb-3">
                        진행: {formatDateShort(application.program.programStart)} - {formatDateShort(application.program.programEnd)}
                      </div>
                      
                      {/* 제목 */}
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 flex-1">
                        {application.program.title}
                      </h3>
                      
                      {/* 마을 이름 */}
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                        <MapPin className="h-4 w-4" />
                        {application.program.organizer?.name || '정보 없음'}
                      </div>

                      {/* 버튼 영역 */}
                      <div className="flex flex-col gap-2 mt-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white" 
                          asChild
                        >
                          <Link href={`/applications/${application.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            상세보기
                          </Link>
                        </Button>
                        {canEdit(application.status) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white" 
                            asChild
                          >
                            <Link href={`/programs/${application.program.id}/apply?edit=${application.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              수정
                            </Link>
                          </Button>
                        )}
                        {canCancel(application.status) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => handleCancelApplication(application.id)}
                            disabled={cancellingId === application.id}
                          >
                            <X className="h-4 w-4 mr-2" />
                            {cancellingId === application.id ? '취소 중...' : '취소'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}