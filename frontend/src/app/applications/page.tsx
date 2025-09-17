'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, Users, Eye, Edit, X, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Application } from '@/types/application';
import { Header } from '@/components/layout/header';
import { UserSidebar } from '@/components/layout/user-sidebar';

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

  const getSelectionStatus = (application: Application) => {
    if (application.selection) {
      if (application.selection.selected) {
        return { status: 'selected', label: '선정됨', icon: CheckCircle, color: 'text-green-600' };
      } else {
        return { status: 'rejected', label: '탈락', icon: XCircle, color: 'text-red-600' };
      }
    }
    return { status: 'pending', label: '심사중', icon: Clock, color: 'text-yellow-600' };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Header />
      <div className="flex">
        <UserSidebar />
        <div className="flex-1">
          <div className="container mx-auto px-6 py-8">
            {/* 히어로 섹션 */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
                내 신청 목록
              </h1>
              <p className="text-xl text-gray-600 mb-6">제출한 프로그램 신청서들을 확인하고 관리하세요</p>
              <div className="flex justify-center space-x-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <span className="text-sm font-medium text-gray-700">총 {applications.length}개의 신청서</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <span className="text-sm font-medium text-gray-700">심사 진행중</span>
                </div>
              </div>
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
          {applications.map((application, index) => {
            const selectionInfo = getSelectionStatus(application);
            const SelectionIcon = selectionInfo.icon;
            const gradientColors = [
              'from-blue-500 to-blue-600',
              'from-blue-600 to-blue-700',
              'from-blue-700 to-blue-800',
              'from-blue-500 to-blue-800',
              'from-blue-600 to-blue-800',
              'from-blue-500 to-blue-700'
            ];
            const gradientColor = gradientColors[index % gradientColors.length];
            
            return (
              <Card key={application.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${gradientColor}`}></div>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl text-gray-800 group-hover:text-blue-600 transition-colors mb-3">
                        {application.program.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className={`${statusColors[application.status]} px-4 py-2 rounded-full text-sm font-medium`}>
                          {statusLabels[application.status]}
                        </Badge>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-full bg-gray-50 ${selectionInfo.color}`}>
                          <SelectionIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{selectionInfo.label}</span>
                        </div>
                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-full">
                          신청일: {new Date(application.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300" asChild>
                        <Link href={`/applications/${application.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          상세보기
                        </Link>
                      </Button>
                      {canEdit(application.status) && (
                        <Button variant="outline" size="sm" className="border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-300" asChild>
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
                          className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                          onClick={() => handleCancelApplication(application.id)}
                          disabled={cancellingId === application.id}
                        >
                          <X className="h-4 w-4 mr-2" />
                          {cancellingId === application.id ? '취소 중...' : '취소'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>주최: {application.program.organizer?.name || '정보 없음'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        프로그램 기간: {new Date(application.program.programStart).toLocaleDateString()} -{' '}
                        {new Date(application.program.programEnd).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* 심사 정보 표시 */}
                  {application.selection && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">심사 결과</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">심사 상태:</span>
                          <span className={selectionInfo.color}>
                            {application.selection.selected ? '선정됨' : '탈락'}
                          </span>
                        </div>
                        {application.selection.reviewedAt && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">심사일:</span>
                            <span>{new Date(application.selection.reviewedAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {application.selection.reason && (
                          <div className="mt-2">
                            <span className="text-gray-600">피드백:</span>
                            <p className="text-gray-800 mt-1">{application.selection.reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {application.program.description && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {application.program.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}