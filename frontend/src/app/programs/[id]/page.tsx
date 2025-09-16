'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar, MapPin, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Program, ProgramStats } from '@/types/program';

const statusLabels: Record<string, string> = {
  draft: '임시저장',
  open: '모집중',
  closed: '모집종료',
  archived: '보관됨',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-200 text-gray-800',
  open: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800',
  archived: 'bg-blue-100 text-blue-800',
};

export default function ProgramDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [stats, setStats] = useState<ProgramStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const programId = params.id as string;

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const [programResponse, statsResponse] = await Promise.all([
          apiClient.get<Program>(API_ENDPOINTS.PROGRAMS.DETAIL(programId)),
          user?.role !== 'applicant' 
            ? apiClient.get<ProgramStats>(API_ENDPOINTS.PROGRAMS.STATS(programId))
            : Promise.resolve({ data: null })
        ]);

        // 백엔드가 ApiResponse 래퍼 없이 직접 데이터를 반환하므로 response.data가 아닌 response를 사용
        const programData = programResponse.data || programResponse;
        setProgram(programData);
        
        if (statsResponse.data) {
          const statsData = statsResponse.data || statsResponse;
          setStats(statsData);
        }
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

  const isAdmin = user?.role === 'admin' || user?.role === 'operator';
  const canApply = user && program.status === 'open'; // admin도 신청 가능하도록 수정 (테스트용)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/programs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">{program.title}</h1>
        <Badge className={statusColors[program.status]}>
          {statusLabels[program.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>프로그램 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              {program.description && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">설명</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{program.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>관리자 기능</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button asChild>
                    <Link href={`/admin/programs/${program.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      수정
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/admin/programs/${program.id}/applications`}>
                      <Users className="h-4 w-4 mr-2" />
                      신청자 목록
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  통계
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">총 신청서</span>
                  <span className="font-medium">{stats.totalApplications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">제출됨</span>
                  <span className="font-medium">{stats.submittedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">심사중</span>
                  <span className="font-medium">{stats.underReviewCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">선정됨</span>
                  <span className="font-medium text-green-600">{stats.selectedCount}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {canApply && (
            <Card>
              <CardContent className="pt-6">
                <Button className="w-full" asChild>
                  <Link href={`/programs/${program.id}/apply`}>
                    신청하기
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
