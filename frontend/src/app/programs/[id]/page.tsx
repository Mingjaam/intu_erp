'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, FolderOpen, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Program } from '@/types/program';
import { Header } from '@/components/layout/header';
import { UserSidebar } from '@/components/layout/user-sidebar';

const statusLabels: Record<string, string> = {
  draft: '신청 전',
  open: '모집중',
  closed: '신청마감',
  ongoing: '진행중',
  completed: '완료',
  archived: '보관',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  closed: 'bg-orange-100 text-orange-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginDialog, setLoginDialog] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false,
  });

  const programId = params.id as string;

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        // 프로그램 정보는 로그인 없이도 조회 가능
        const programResponse = await apiClient.get<Program>(API_ENDPOINTS.PROGRAMS.DETAIL(programId));
        const programData = programResponse.data || programResponse;
        setProgram(programData);
        
      } catch (error) {
        console.error('프로그램 조회 오류:', error);
        toast.error('프로그램 정보를 불러오는데 실패했습니다.');
        router.push('/programs');
      } finally {
        setIsLoading(false);
      }
    };

    if (programId) {
      fetchProgram();
    }
  }, [programId, user, router]);

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
            <Link href="/programs">프로그램 목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }


  // 로그인 다이얼로그 열기
  const openLoginDialog = () => {
    setLoginDialog({ isOpen: true });
  };

  // 로그인 다이얼로그 닫기
  const closeLoginDialog = () => {
    setLoginDialog({ isOpen: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Header />
      <div className="flex">
        <UserSidebar />
        <div className="flex-1 pb-16 md:pb-0">
          <div className="container mx-auto px-6 py-8">
            {/* 프로그램 헤더 */}
            <div className="mb-8">
              {/* 제목, 한줄소개, 상태, 주최 */}
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {program.title}
                </h1>
                {program.summary && (
                  <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
                    {program.summary}
                  </p>
                )}
                <div className="flex justify-center items-center gap-4 mb-6">
                  <Badge className={`${statusColors[program.status]} px-4 py-2 rounded-full text-sm font-medium`}>
                    {statusLabels[program.status]}
                  </Badge>
                  <div className="bg-gray-100 rounded-full px-4 py-2">
                    <span className="text-sm font-medium text-gray-700">주최: {program.organizer.name}</span>
                  </div>
                </div>
              </div>

              {/* 이미지 - 3:4 비율 세로형 */}
              <div className="max-w-md mx-auto mb-8">
                {program.imageUrl ? (
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-lg">
                    <div className="relative w-full h-full">
                      {/* 흐림 배경 */}
                      <div 
                        className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-sm scale-110"
                        style={{ backgroundImage: `url(${program.imageUrl})` }}
                      />
                      {/* 메인 이미지 */}
                      <img
                        src={program.imageUrl}
                        alt={program.title}
                        className="relative z-10 w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[3/4] w-full bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-80" />
                      <p className="text-lg font-medium">프로그램 이미지</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 프로그램 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <h3 className="font-semibold text-sm text-gray-700 mb-1">신청기간</h3>
                    <p className="text-xs text-gray-600">
                      {new Date(program.applyStart).toLocaleDateString('ko-KR')} ~ {new Date(program.applyEnd).toLocaleDateString('ko-KR')}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <h3 className="font-semibold text-sm text-gray-700 mb-1">활동기간</h3>
                    <p className="text-xs text-gray-600">
                      {new Date(program.programStart).toLocaleDateString('ko-KR')} ~ {new Date(program.programEnd).toLocaleDateString('ko-KR')}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="h-6 w-6 mx-auto mb-2 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">₩</span>
                    </div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-1">참가비</h3>
                    <p className="text-xs text-gray-600">
                      {program.fee === 0 ? '무료' : `₩${program.fee.toLocaleString()}`}
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="h-6 w-6 mx-auto mb-2 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">👥</span>
                    </div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-1">최대참가자</h3>
                    <p className="text-xs text-gray-600">
                      {program.maxParticipants}명
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 프로그램 상세 정보 */}
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">프로그램 설명</CardTitle>
                </CardHeader>
                <CardContent>
                  {program.description && (
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{program.description}</p>
                    </div>
                  )}
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>장소: {program.location || '미정'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 신청 버튼 */}
              {program.status === 'open' && (
                <div className="mt-8 text-center">
                  {user ? (
                    user.role === 'applicant' ? (
                      <Button size="lg" className="px-8 py-3" asChild>
                        <Link href={`/programs/${program.id}/apply`}>
                          <UserPlus className="h-5 w-5 mr-2" />
                          신청하기
                        </Link>
                      </Button>
                    ) : (
                      <div className="text-center text-gray-600">
                        <p className="mb-2">신청은 신청자(applicant) 역할의 사용자만 가능합니다.</p>
                        <p className="text-sm">현재 역할: {user.role}</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center space-y-4">
                      <p className="text-gray-600">신청하려면 로그인이 필요합니다.</p>
                      <Button 
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                        onClick={openLoginDialog}
                      >
                        <LogIn className="h-5 w-5 mr-2" />
                        로그인 후 신청하기
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 로그인 다이얼로그 */}
      <Dialog open={loginDialog.isOpen} onOpenChange={closeLoginDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">
              로그인이 필요한 서비스입니다
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 프로그램 정보 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {program.title}
              </h3>
              <p className="text-sm text-gray-600">
                프로그램에 신청하려면 로그인이 필요합니다.
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700 text-center">
                로그인 후 프로그램 신청이 가능합니다.
              </p>
            </div>

            {/* 버튼 그룹 */}
            <div className="space-y-3">
              <Button
                asChild
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
              >
                <Link href="/auth/login">
                  <LogIn className="h-5 w-5 mr-2" />
                  로그인하기
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Link href="/auth/register">
                  <UserPlus className="h-5 w-5 mr-2" />
                  회원가입하기
                </Link>
              </Button>
              <Button
                variant="ghost"
                onClick={closeLoginDialog}
                className="w-full"
                size="lg"
              >
                취소
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
