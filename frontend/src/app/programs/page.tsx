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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">프로그램 목록</h1>
        <p className="text-gray-600">다양한 지원 프로그램을 확인하고 신청하세요.</p>
      </div>

      {user?.role === 'admin' || user?.role === 'operator' ? (
        <div className="mb-6">
          <Button>새 프로그램 생성</Button>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs && programs.length > 0 ? programs.map((program) => (
          <Card key={program.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{program.title}</CardTitle>
                <Badge className={statusColors[program.status]}>
                  {statusLabels[program.status]}
                </Badge>
              </div>
              <CardDescription className="text-sm text-gray-600">
                {program.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {program.organizer.name}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(program.applyStart)} ~ {formatDate(program.applyEnd)}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {isApplicationOpen(program) ? '신청 가능' : '신청 마감'}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <Link href={`/programs/${program.id}`}>
                    상세보기
                  </Link>
                </Button>
                {isApplicationOpen(program) && user?.role === 'applicant' && (
                  <Button className="flex-1" asChild>
                    <Link href={`/programs/${program.id}/apply`}>
                      신청하기
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )) : null}
      </div>

      {programs && programs.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 프로그램이 없습니다</h3>
          <p className="text-gray-600">새로운 프로그램이 등록되면 알려드리겠습니다.</p>
        </div>
      )}
    </div>
  );
}
