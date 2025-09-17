'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import Link from 'next/link';
import { Program } from '@/types/program';
import { Header } from '@/components/layout/header';
import { UserSidebar } from '@/components/layout/user-sidebar';

// Program interface는 이미 types/program.ts에서 import하므로 제거

const statusLabels = {
  draft: '임시저장',
  open: '모집중',
  closed: '종료',
  archived: '보관',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

export default function ProgramsPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const now = new Date();
    const startDate = new Date(program.applyStart);
    const endDate = new Date(program.applyEnd);
    return now >= startDate && now <= endDate && program.status === 'open';
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
        <div className="flex-1">
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
            </div>


      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {programs && programs.length > 0 ? programs.map((program, index) => {
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
            <Card key={program.id} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/90 backdrop-blur-sm border-0 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${gradientColor}`}></div>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <CardTitle className="text-xl text-gray-800 group-hover:text-blue-600 transition-colors">
                    {program.title}
                  </CardTitle>
                  <Badge className={`${statusColors[program.status]} px-3 py-1 rounded-full text-xs font-medium`}>
                    {statusLabels[program.status]}
                  </Badge>
                </div>
                <CardDescription className="text-gray-600 leading-relaxed line-clamp-3">
                  {program.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    <MapPin className="h-4 w-4 mr-3 text-blue-500" />
                    <span className="font-medium">{program.organizer.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    <Calendar className="h-4 w-4 mr-3 text-green-500" />
                    <span className="font-medium">{formatDate(program.applyStart)} ~ {formatDate(program.applyEnd)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    <Clock className="h-4 w-4 mr-3 text-purple-500" />
                    <span className="font-medium">{isApplicationOpen(program) ? '신청 가능' : '신청 마감'}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300" asChild>
                    <Link href={`/programs/${program.id}`}>
                      상세보기
                    </Link>
                  </Button>
                  {isApplicationOpen(program) && user?.role === 'applicant' && (
                    <Button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                      <Link href={`/programs/${program.id}/apply`}>
                        신청하기
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
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
    </div>
  );
}
