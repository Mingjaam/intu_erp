'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, MapPin, Users, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { Program } from '@/types/program';
import { Header } from '@/components/layout/header';
import { UserSidebar } from '@/components/layout/user-sidebar';

// Program interface는 이미 types/program.ts에서 import하므로 제거

const statusLabels = {
  draft: '신청 전',
  open: '모집중',
  closed: '신청마감',
  ongoing: '진행중',
  completed: '완료',
  archived: '보관',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  closed: 'bg-orange-100 text-orange-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

export default function ProgramsPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginDialog, setLoginDialog] = useState<{
    isOpen: boolean;
    programId: string;
    programTitle: string;
  }>({
    isOpen: false,
    programId: '',
    programTitle: '',
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ programs: Program[]; total: number }>(API_ENDPOINTS.PROGRAMS.LIST);
      // 백엔드가 ApiResponse 래퍼 없이 직접 데이터를 반환하므로 response.data가 아닌 response를 사용
      const data = response.data || response;
      setPrograms(data.programs || []);
    } catch (err) {
      setError('프로그램 목록을 불러오는데 실패했습니다.');
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isApplicationOpen = (program: Program) => {
    // 상태가 'open'인 경우에만 신청 가능
    return program.status === 'open';
  };

  // 로그인 다이얼로그 열기
  const openLoginDialog = (programId: string, programTitle: string) => {
    setLoginDialog({
      isOpen: true,
      programId,
      programTitle,
    });
  };

  // 로그인 다이얼로그 닫기
  const closeLoginDialog = () => {
    setLoginDialog({
      isOpen: false,
      programId: '',
      programTitle: '',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPrograms}>다시 시도</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Header />
      <div className="flex">
        <UserSidebar />
        <div className="flex-1 pb-16 md:pb-0">
          <div className="container mx-auto px-6 py-8">
            {/* 히어로 섹션 */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
                마을 프로그램
              </h1>
              <p className="text-xl text-gray-600 mb-6">함께 성장하는 마을을 위한 다양한 프로그램을 만나보세요</p>
              <div className="flex justify-center space-x-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <span className="text-sm font-medium text-gray-700">총 {programs.length}개의 프로그램</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <span className="text-sm font-medium text-gray-700">지금 신청 가능</span>
                </div>
              </div>
              
              {/* 로그인하지 않은 사용자를 위한 안내 */}
              {!user && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-blue-700 mb-2">
                    💡 프로그램에 신청하려면 로그인이 필요합니다
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Link href="/auth/login">
                      <Button size="sm" variant="outline">로그인</Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button size="sm">회원가입</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>


      <div className="grid gap-6 md:grid-cols-2">
        {programs && programs.length > 0 ? programs.map((program, index) => {
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
            <Link key={program.id} href={`/programs/${program.id}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 bg-white border-0 overflow-hidden cursor-pointer">
                <div className="flex">
                {/* 이미지 영역 - 왼쪽 */}
                <div className="relative aspect-[3/4] w-48 flex-shrink-0 overflow-hidden">
                  {program.imageUrl ? (
                    <div className="relative w-full h-full">
                      {/* 흐림 배경 */}
                      <div 
                        className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-sm scale-110"
                        style={{ backgroundImage: `url(${program.imageUrl})` }}
                      />
                      {/* 메인 이미지 */}
                      <Image
                        src={program.imageUrl}
                        alt={program.title}
                        fill
                        className="relative z-10 object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradientColor} flex items-center justify-center`}>
                      <div className="text-white text-center">
                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-80" />
                        <p className="text-sm font-medium">프로그램 이미지</p>
                      </div>
                    </div>
                  )}
                  {/* 상태 배지 */}
                  <div className="absolute top-3 right-3 z-20">
                    <Badge className={`${statusColors[program.status]} px-2 py-1 rounded-full text-xs font-medium shadow-lg`}>
                      {statusLabels[program.status]}
                    </Badge>
                  </div>
                  {/* D-Day 배지 */}
                  {program.status === 'open' && program.daysUntilDeadline !== undefined && (
                    <div className="absolute top-3 left-3 z-20">
                      <Badge 
                        className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                          program.daysUntilDeadline <= 3 
                            ? 'bg-red-500 text-white' 
                            : program.daysUntilDeadline <= 7 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        {program.daysUntilDeadline > 0 
                          ? `D-${program.daysUntilDeadline}` 
                          : program.daysUntilDeadline === 0 
                          ? 'D-Day' 
                          : '마감됨'
                        }
                      </Badge>
                    </div>
                  )}
                  {/* 신청 가능 여부 오버레이 */}
                  {isApplicationOpen(program) && program.status === 'open' && (
                    <div className="absolute bottom-3 left-3 z-20">
                      <Badge className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg">
                        신청 가능
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* 정보 영역 - 오른쪽 */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    {/* 태그들 */}
                    <div className="flex gap-2 mb-3">
                      <Badge className={`${statusColors[program.status]} px-2 py-1 rounded-full text-xs font-medium`}>
                        {statusLabels[program.status]}
                      </Badge>
                      {program.status === 'open' && program.daysUntilDeadline !== undefined && (
                        <Badge 
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            program.daysUntilDeadline <= 3 
                              ? 'bg-red-500 text-white' 
                              : program.daysUntilDeadline <= 7 
                              ? 'bg-orange-500 text-white' 
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          {program.daysUntilDeadline > 0 
                            ? `D-${program.daysUntilDeadline}` 
                            : program.daysUntilDeadline === 0 
                            ? 'D-Day' 
                            : '마감됨'
                          }
                        </Badge>
                      )}
                    </div>
                    
                    {/* 제목 */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {program.title}
                    </h3>
                    
                    {/* 한줄 설명 */}
                    {program.summary && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {program.summary}
                      </p>
                    )}
                    
                    {/* 조직 정보 */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4" />
                      {program.organizer.name}
                    </div>
                    
                    {/* 신청기간, 활동기간 */}
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>신청기간: {formatDate(program.applyStart)} ~ {formatDate(program.applyEnd)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>활동기간: {formatDate(program.programStart)} ~ {formatDate(program.programEnd)}</span>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
              </Card>
            </Link>
          );
        }) : null}
      </div>

            {programs && programs.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 프로그램이 없습니다</h3>
                <p className="text-gray-600">새로운 프로그램이 등록되면 알려드리겠습니다.</p>
              </div>
            )}
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
                {loginDialog.programTitle}
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
