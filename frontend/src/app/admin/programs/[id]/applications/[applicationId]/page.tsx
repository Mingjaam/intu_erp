'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, MapPin, Users, User, Mail, Phone, Building, FileText, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Application, Program } from '@/types/application';

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

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [application, setApplication] = useState<Application | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const programId = params.id as string;
  const applicationId = params.applicationId as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 신청서 상세 정보와 모든 신청서 목록을 동시에 가져오기
        const [applicationResponse, applicationsResponse] = await Promise.all([
          apiClient.get<Application>(API_ENDPOINTS.APPLICATIONS.DETAIL(applicationId)),
          apiClient.get<{ applications: Application[]; total: number }>(
            API_ENDPOINTS.APPLICATIONS.BY_PROGRAM(programId)
          )
        ]);

        const applicationData = applicationResponse.data || applicationResponse;
        const applicationsData = applicationsResponse.data || applicationsResponse;
        
        setApplication(applicationData);
        setProgram(applicationData.program);
        
        const apps = applicationsData.applications || [];
        setAllApplications(apps);
        
        // 현재 신청서의 인덱스 찾기
        const index = apps.findIndex(app => app.id === applicationId);
        setCurrentIndex(index >= 0 ? index : 0);
      } catch (error) {
        console.error('데이터 조회 오류:', error);
        toast.error('신청서 정보를 불러오는데 실패했습니다.');
        router.push(`/admin/programs/${programId}/applications`);
      } finally {
        setIsLoading(false);
      }
    };

    if (programId && applicationId) {
      fetchData();
    }
  }, [programId, applicationId, router]);

  // 사용자 정보가 없거나 권한이 없으면 접근 거부
  if (!user || (user.role !== 'admin' && user.role !== 'operator' && user.role !== 'staff')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-6">신청서 상세를 볼 권한이 없습니다.</p>
          <Button onClick={() => router.back()}>뒤로가기</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (!application || !program) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">신청서를 찾을 수 없습니다</h1>
          <Button asChild>
            <Link href={`/admin/programs/${programId}/applications`}>신청자 목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 이전/다음 신청서로 이동
  const handleNavigate = (direction: 'prev' | 'next') => {
    let newIndex = currentIndex;
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
    } else if (direction === 'next' && currentIndex < allApplications.length - 1) {
      newIndex = currentIndex + 1;
    }

    if (newIndex !== currentIndex) {
      const nextApplication = allApplications[newIndex];
      router.push(`/admin/programs/${programId}/applications/${nextApplication.id}`);
    }
  };

  // 구글 폼 스타일로 폼 데이터 렌더링
  const renderFormData = (data: Record<string, unknown>) => {
    const applicationForm = program.applicationForm as { fields?: Array<{ 
      name: string; 
      label: string; 
      type: string;
      options?: string[];
      required?: boolean;
    }> } | undefined;
    const fields = applicationForm?.fields || [];
    
    // 필드 이름을 label로 매핑하는 맵 생성
    const fieldLabelMap = new Map<string, { label: string; type: string; options?: string[]; required?: boolean }>();
    fields.forEach(field => {
      fieldLabelMap.set(field.name, {
        label: field.label,
        type: field.type,
        options: field.options,
        required: field.required
      });
    });
    
    return Object.entries(data).map(([key, value]) => {
      if (key === 'applicantInfo') return null;
      
      const fieldInfo = fieldLabelMap.get(key);
      const displayLabel = fieldInfo?.label || key;
      const fieldType = fieldInfo?.type || 'text';
      
      let displayValue: React.ReactNode = String(value);
      
      // 타입에 따라 값 포맷팅
      if (Array.isArray(value)) {
        displayValue = value.join(', ');
      } else if (fieldType === 'checkbox' && Array.isArray(value)) {
        displayValue = value.join(', ');
      } else if (fieldType === 'select' && fieldInfo?.options) {
        displayValue = String(value);
      } else if (typeof value === 'boolean') {
        displayValue = value ? '예' : '아니오';
      }
      
      return (
        <div key={key} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
          <div className="mb-2">
            <label className="text-sm font-medium text-gray-700">
              {displayLabel}
              {fieldInfo && fieldInfo.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
          <div className="text-base text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-200">
            {displayValue || <span className="text-gray-400">답변 없음</span>}
          </div>
        </div>
      );
    });
  };

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allApplications.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 및 네비게이션 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/programs/${programId}/applications`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  신청자 목록으로
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">신청서 상세</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {currentIndex + 1} / {allApplications.length}
                </p>
              </div>
            </div>
            
            {/* 이전/다음 네비게이션 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate('prev')}
                disabled={!hasPrev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate('next')}
                disabled={!hasNext}
              >
                다음
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 메인 콘텐츠 영역 (구글 폼 스타일) */}
          <div className="lg:col-span-3 space-y-6">
            {/* 프로그램 정보 카드 */}
            <Card>
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="text-lg">{program.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>주최: {program.organizer.name}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      프로그램 기간: {program.programStart ? new Date(program.programStart).toLocaleDateString() : '미정'} -{' '}
                      {program.programEnd ? new Date(program.programEnd).toLocaleDateString() : '미정'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span>최대 참여자: {program.maxParticipants}명</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>참가비: ₩{program.fee.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 신청서 폼 데이터 (구글 폼 스타일) */}
            <Card>
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="flex items-center text-lg">
                  <FileText className="h-5 w-5 mr-2" />
                  신청서 응답
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  {renderFormData(application.payload)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 - 신청자 정보 및 상태 */}
          <div className="space-y-6">
            {/* 신청자 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  신청자 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">이름</span>
                  </div>
                  <p className="font-medium text-gray-900">{application.applicant.name}</p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-500">이메일</span>
                  </div>
                  <p className="text-sm text-gray-900">{application.applicant.email}</p>
                </div>
                
                {application.applicant.phone && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">전화번호</span>
                    </div>
                    <p className="text-sm text-gray-900">{application.applicant.phone}</p>
                  </div>
                )}
                
                {application.applicant.organization && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-500">소속</span>
                    </div>
                    <p className="text-sm text-gray-900">{application.applicant.organization.name}</p>
                  </div>
                )}

                {application.applicant.reportCount && application.applicant.reportCount > 0 && (
                  <div className="pt-2 border-t">
                    <Badge className="bg-orange-100 text-orange-800">
                      신고 {application.applicant.reportCount}건
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 신청 상태 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">신청 상태</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-gray-500 mb-2">현재 상태</div>
                  <Badge className={statusColors[application.status]}>
                    {statusLabels[application.status]}
                  </Badge>
                </div>
                
                <div>
                  <div className="text-xs text-gray-500 mb-1">신청일</div>
                  <p className="text-sm text-gray-900">
                    {new Date(application.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                {application.updatedAt && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">최종 수정일</div>
                    <p className="text-sm text-gray-900">
                      {new Date(application.updatedAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}

                {/* 입금 상태 (합격된 경우에만) */}
                {application.status === 'selected' && (
                  <div className="pt-4 border-t">
                    <div className="text-xs text-gray-500 mb-2">입금 상태</div>
                    <div className="flex items-center gap-2">
                      {application.isPaymentReceived ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">입금 확인됨</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">입금 대기중</span>
                        </>
                      )}
                    </div>
                    {application.paymentReceivedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(application.paymentReceivedAt).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </div>
                )}

                {/* 관리자 메모 */}
                {application.notes && (
                  <div className="pt-4 border-t">
                    <div className="text-xs text-gray-500 mb-2">관리자 메모</div>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">
                      {application.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 액션 버튼 */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    asChild
                  >
                    <Link href={`/admin/programs/${programId}/applications`}>
                      목록으로 돌아가기
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

