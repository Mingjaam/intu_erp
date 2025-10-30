'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, FolderOpen, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Program } from '@/types/program';
import { Header } from '@/components/layout/header';
import { UserSidebar } from '@/components/layout/user-sidebar';

const statusLabels: Record<string, string> = {
  // 기존 상태들
  draft: '신청전',
  open: '신청중',
  closed: '진행중',
  ongoing: '진행중',
  completed: '완료',
  archived: '보관',
  
  // 새로운 상태들
  before_application: '신청전',
  application_open: '신청중',
  in_progress: '진행중',
};

const statusColors: Record<string, string> = {
  // 기존 상태들
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  closed: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  archived: 'bg-yellow-100 text-yellow-800',
  
  // 새로운 상태들
  before_application: 'bg-gray-100 text-gray-800',
  application_open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
};

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }, [programId, router]);

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
                  <Badge className={`${statusColors[program.status]} px-4 py-2 rounded-full text-sm font-medium border-0`}>
                    {statusLabels[program.status]}
                  </Badge>
                  <div className="bg-gray-100 rounded-full px-4 py-2">
                    <span className="text-sm font-medium text-gray-700">주최: {program.organizer.name}</span>
                  </div>
                </div>
              </div>

              {/* 2열 레이아웃: 이미지 왼쪽, 정보 카드들 오른쪽 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* 왼쪽: 이미지 */}
                <div className="flex justify-center lg:justify-start">
                  {program.imageUrl ? (
                    <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl shadow-lg">
                      <div className="relative w-full h-full">
                        {/* 흐림 배경 - 빈 공간 채우기 */}
                        <div 
                          className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-md scale-110"
                          style={{ backgroundImage: `url(${program.imageUrl})` }}
                        />
                        {/* 메인 이미지 - 4:3 비율에 맞춤 */}
                        <Image
                          src={program.imageUrl}
                          alt={program.title}
                          fill
                          className="relative z-10 object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[4/3] w-full max-w-sm bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center">
                      <div className="text-white text-center">
                        <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-80" />
                        <p className="text-lg font-medium">프로그램 이미지</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 오른쪽: 프로그램 기본 정보 + 신청 버튼 */}
                <div className="space-y-4">
                  {/* 정보 카드들 */}
                  <div className="space-y-3">
                    <Card>
                      <CardContent className="p-3 text-center">
                        <Calendar className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                        <h3 className="font-semibold text-xs text-gray-700 mb-1">신청기간</h3>
                        <p className="text-xs text-gray-600">
                          {new Date(program.applyStart).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })} ~ {new Date(program.applyEnd).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-3 text-center">
                        <Calendar className="h-5 w-5 mx-auto mb-1 text-green-500" />
                        <h3 className="font-semibold text-xs text-gray-700 mb-1">활동기간</h3>
                        <p className="text-xs text-gray-600">
                          {new Date(program.programStart).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })} ~ {new Date(program.programEnd).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-3 text-center">
                        <div className="h-5 w-5 mx-auto mb-1 bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">₩</span>
                        </div>
                        <h3 className="font-semibold text-xs text-gray-700 mb-1">참가비</h3>
                        <p className="text-xs text-gray-600">
                          {program.fee === 0 ? '무료' : `₩${program.fee.toLocaleString()}`}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-3 text-center">
                        <div className="h-5 w-5 mx-auto mb-1 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">👥</span>
                        </div>
                        <h3 className="font-semibold text-xs text-gray-700 mb-1">최대참가자</h3>
                        <p className="text-xs text-gray-600">
                          {program.maxParticipants}명
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 신청 버튼 */}
                  <div className="text-center">
                    {user ? (
                      user.role === 'applicant' ? (
                        program.status === 'application_open' || program.status === 'open' ? (
                          <Button 
                            size="lg" 
                            className="px-6 py-3" 
                            asChild
                          >
                            <Link href={`/programs/${program.id}/apply`}>
                              <UserPlus className="h-5 w-5 mr-2" />
                              신청하기
                            </Link>
                          </Button>
                        ) : (
                          <Button 
                            size="lg" 
                            className="px-6 py-3" 
                            disabled
                          >
                            <UserPlus className="h-5 w-5 mr-2" />
                            신청 불가
                          </Button>
                        )
                      ) : (
                        <div className="text-center text-gray-600">
                          <p className="mb-2 text-sm">신청은 로그인 후 가능합니다.</p>
                          <p className="text-xs">현재 역할: {user.role}</p>
                        </div>
                      )
                    ) : (
                      <div className="text-center">
                        <Button 
                          size="lg"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                          disabled
                        >
                          <LogIn className="h-5 w-5 mr-2" />
                          {program.status === 'application_open' || program.status === 'open' ? '로그인 후 신청하기' : '신청 불가'}
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          {program.status === 'application_open' || program.status === 'open' ? '신청하려면 로그인이 필요합니다.' : '현재 신청 기간이 아닙니다.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
