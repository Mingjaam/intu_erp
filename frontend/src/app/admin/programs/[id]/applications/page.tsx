'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar, MapPin, Users, Eye, Search, Download, CheckCircle, XCircle, DollarSign, Edit, Save, X } from 'lucide-react';
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

export default function ProgramApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewDialog, setReviewDialog] = useState<{
    isOpen: boolean;
    applicationId: string;
    applicantName: string;
  }>({
    isOpen: false,
    applicationId: '',
    applicantName: '',
  });

  // 수정 모달 상태
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    status: 'submitted' as 'submitted' | 'under_review' | 'selected' | 'rejected' | 'withdrawn',
    notes: ''
  });

  const programId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programResponse, applicationsResponse] = await Promise.all([
          apiClient.get<Program>(API_ENDPOINTS.PROGRAMS.DETAIL(programId)),
          apiClient.get<{ applications: Application[]; total: number }>(
            API_ENDPOINTS.APPLICATIONS.BY_PROGRAM(programId)
          )
        ]);

        const programData = programResponse.data || programResponse;
        const applicationsData = applicationsResponse.data || applicationsResponse;
        
        setProgram(programData);
        setApplications(applicationsData.applications || []);
      } catch (error) {
        console.error('데이터 조회 오류:', error);
        toast.error('데이터를 불러오는데 실패했습니다.');
        router.push('/admin/programs');
      } finally {
        setIsLoading(false);
      }
    };

    if (programId) {
      fetchData();
    }
  }, [programId, router]);

  // 사용자 정보가 없거나 권한이 없으면 접근 거부
  if (!user || (user.role !== 'admin' && user.role !== 'operator' && user.role !== 'staff')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-6">신청자 목록을 볼 권한이 없습니다.</p>
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

  if (!program) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">프로그램을 찾을 수 없습니다</h1>
          <Button asChild>
            <Link href="/admin/programs">프로그램 목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 검색 필터링
  const filteredApplications = applications.filter(application => {
    const searchLower = searchTerm.toLowerCase();
    return (
      application.applicant.name.toLowerCase().includes(searchLower) ||
      application.applicant.email.toLowerCase().includes(searchLower) ||
      (application.applicant.organization?.name || '').toLowerCase().includes(searchLower)
    );
  });

  const getStatusCounts = () => {
    const counts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return counts;
  };

  const statusCounts = getStatusCounts();

  const handleReview = async (applicationId: string, decision: 'selected' | 'rejected') => {
    try {
      await apiClient.patch(API_ENDPOINTS.APPLICATIONS.REVIEW(applicationId), { decision });
      toast.success(`신청서가 ${decision === 'selected' ? '합격' : '불합격'} 처리되었습니다.`);
      
      // 데이터 새로고침
      const applicationsResponse = await apiClient.get<{ applications: Application[]; total: number }>(
        API_ENDPOINTS.APPLICATIONS.BY_PROGRAM(programId)
      );
      const applicationsData = applicationsResponse.data || applicationsResponse;
      setApplications(applicationsData.applications || []);
      
      setReviewDialog({ isOpen: false, applicationId: '', applicantName: '' });
    } catch (error) {
      console.error('심사 처리 오류:', error);
      toast.error('심사 처리에 실패했습니다.');
    }
  };

  const handlePaymentStatusChange = async (applicationId: string, isPaymentReceived: boolean) => {
    try {
      await apiClient.patch(API_ENDPOINTS.APPLICATIONS.PAYMENT(applicationId), { isPaymentReceived });
      toast.success(`입금 상태가 ${isPaymentReceived ? '확인' : '취소'}되었습니다.`);
      
      // 데이터 새로고침
      const applicationsResponse = await apiClient.get<{ applications: Application[]; total: number }>(
        API_ENDPOINTS.APPLICATIONS.BY_PROGRAM(programId)
      );
      const applicationsData = applicationsResponse.data || applicationsResponse;
      setApplications(applicationsData.applications || []);
      
      // 프로그램 정보도 새로고침 (매출 업데이트)
      const programResponse = await apiClient.get<Program>(API_ENDPOINTS.PROGRAMS.DETAIL(programId));
      const programData = programResponse.data || programResponse;
      setProgram(programData);
    } catch (error) {
      console.error('입금 상태 변경 오류:', error);
      toast.error('입금 상태 변경에 실패했습니다.');
    }
  };

  // 수정 모달 열기
  const openEditModal = (application: Application) => {
    setEditingApplication(application);
    setEditFormData({
      status: application.status as 'submitted' | 'under_review' | 'selected' | 'rejected' | 'withdrawn',
      notes: application.notes || ''
    });
    setIsEditModalOpen(true);
  };

  // 수정 모달 닫기
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingApplication(null);
  };

  // 신청서 정보 수정
  const handleUpdateApplication = async () => {
    if (!editingApplication) return;

    try {
      await apiClient.patch(
        API_ENDPOINTS.APPLICATIONS.UPDATE(editingApplication.id),
        editFormData
      );
      
      toast.success('신청서 정보가 수정되었습니다.');
      closeEditModal();
      
      // 데이터 새로고침
      const applicationsResponse = await apiClient.get<{ applications: Application[]; total: number }>(
        API_ENDPOINTS.APPLICATIONS.BY_PROGRAM(programId)
      );
      const applicationsData = applicationsResponse.data || applicationsResponse;
      setApplications(applicationsData.applications || []);
    } catch (error) {
      console.error('신청서 정보 수정 오류:', error);
      toast.error('신청서 정보 수정에 실패했습니다.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/programs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              프로그램 목록으로
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">신청자 목록</h1>
        </div>
        <p className="text-gray-600">{program.title} 프로그램의 신청자 목록입니다.</p>
      </div>

      {/* 프로그램 정보 요약 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>프로그램 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span>주최: {program.organizer.name}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                신청 기간: {new Date(program.applyStart).toLocaleDateString()} -{' '}
                {new Date(program.applyEnd).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              <span>최대 참여자: {program.maxParticipants}명</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>참가비: ₩{program.fee.toLocaleString()}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>현재 매출: ₩{(program.revenue || 0).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 및 검색 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
              <div className="text-sm text-gray-600">총 신청자</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.selected || 0}</div>
              <div className="text-sm text-gray-600">선정됨</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.under_review || 0}</div>
              <div className="text-sm text-gray-600">심사중</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.rejected || 0}</div>
              <div className="text-sm text-gray-600">불합격</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 액션 */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="신청자 이름, 이메일, 소속으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-80"
          />
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          엑셀 다운로드
        </Button>
      </div>

      {/* 신청자 목록 */}
      {filteredApplications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? '검색 결과가 없습니다' : '신청자가 없습니다'}
              </h3>
              <p className="text-gray-600">
                {searchTerm ? '다른 검색어를 시도해보세요.' : '아직 이 프로그램에 신청한 사용자가 없습니다.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <Card key={application.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {application.applicant.name}
                      </h3>
                      <Badge className={statusColors[application.status]}>
                        {statusLabels[application.status]}
                      </Badge>
                      {application.applicant.reportCount && application.applicant.reportCount > 0 ? (
                        <Badge className="bg-orange-100 text-orange-800">
                          신고 {application.applicant.reportCount}건
                        </Badge>
                      ) : null}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">이메일:</span> {application.applicant.email}
                      </div>
                      <div>
                        <span className="font-medium">전화번호:</span> {application.applicant.phone || '미입력'}
                      </div>
                      <div>
                        <span className="font-medium">소속:</span> {application.applicant.organization?.name || '미입력'}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 mt-2">
                      신청일: {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                    
                    {/* 입금 상태 표시 (합격된 경우에만) */}
                    {application.status === 'selected' && (
                      <div className="mt-2 flex items-center gap-2">
                        <Checkbox
                          id={`payment-${application.id}`}
                          checked={application.isPaymentReceived || false}
                          onCheckedChange={(checked) => 
                            handlePaymentStatusChange(application.id, checked as boolean)
                          }
                        />
                        <label 
                          htmlFor={`payment-${application.id}`}
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          입금 확인 (₩{program.fee.toLocaleString()})
                        </label>
                        {application.paymentReceivedAt && (
                          <span className="text-xs text-green-600">
                            ({new Date(application.paymentReceivedAt).toLocaleDateString()})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/programs/${programId}/applications/${application.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        상세보기
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditModal(application)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    
                    {/* 심사하기 버튼 (제출됨, 심사중, 철회됨 상태일 때) */}
                    {(application.status === 'submitted' || application.status === 'under_review' || application.status === 'withdrawn') && (
                      <Dialog 
                        open={reviewDialog.isOpen && reviewDialog.applicationId === application.id}
                        onOpenChange={(open) => setReviewDialog({
                          isOpen: open,
                          applicationId: open ? application.id : '',
                          applicantName: open ? application.applicant.name : '',
                        })}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            심사하기
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-center text-lg font-semibold">
                              신청서 심사
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* 신청자 정보 */}
                            <div className="text-center">
                              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Users className="h-8 w-8 text-blue-600" />
                              </div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {application.applicant.name}님
                              </h3>
                              <p className="text-sm text-gray-600">
                                {application.applicant.email}
                              </p>
                              {application.applicant.organization?.name && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {application.applicant.organization.name}
                                </p>
                              )}
                            </div>

                            {/* 심사 안내 */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-700 text-center">
                                이 신청서의 심사 결과를 선택해주세요.
                              </p>
                            </div>

                            {/* 버튼 그룹 */}
                            <div className="space-y-3">
                              <Button
                                onClick={() => handleReview(application.id, 'selected')}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                size="lg"
                              >
                                <CheckCircle className="h-5 w-5 mr-2" />
                                합격
                              </Button>
                              <Button
                                onClick={() => handleReview(application.id, 'rejected')}
                                className="w-full bg-gray-600 hover:bg-gray-700 text-white"
                                size="lg"
                              >
                                <XCircle className="h-5 w-5 mr-2" />
                                불합격
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setReviewDialog({ isOpen: false, applicationId: '', applicantName: '' })}
                                className="w-full"
                                size="lg"
                              >
                                취소
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 수정 모달 */}
      <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>신청서 정보 수정</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* 신청자 정보 */}
            {editingApplication && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">신청자 정보</h4>
                <div className="text-sm text-gray-600">
                  <p><strong>이름:</strong> {editingApplication.applicant.name}</p>
                  <p><strong>이메일:</strong> {editingApplication.applicant.email}</p>
                  <p><strong>소속:</strong> {editingApplication.applicant.organization?.name || '미입력'}</p>
                </div>
              </div>
            )}

            {/* 신청서 상태 */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                신청서 상태
              </Label>
              <Select
                value={editFormData.status}
                onValueChange={(value: 'submitted' | 'under_review' | 'selected' | 'rejected' | 'withdrawn') => 
                  setEditFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="상태를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="submitted">제출됨</SelectItem>
                  <SelectItem value="under_review">심사중</SelectItem>
                  <SelectItem value="selected">선정됨</SelectItem>
                  <SelectItem value="rejected">불합격</SelectItem>
                  <SelectItem value="withdrawn">철회됨</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 관리자 메모 */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                관리자 메모
              </Label>
              <Textarea
                id="notes"
                placeholder="관리자 메모를 입력하세요..."
                value={editFormData.notes}
                onChange={(e) => 
                  setEditFormData(prev => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeEditModal}>
              <X className="h-4 w-4 mr-1" />
              취소
            </Button>
            <Button onClick={handleUpdateApplication}>
              <Save className="h-4 w-4 mr-1" />
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
