'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { 
  Calendar, 
  FolderOpen,
  ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Program {
  id: string;
  title: string;
  description: string;
  summary?: string;
  status: 'draft' | 'open' | 'closed' | 'archived';
  maxParticipants: number;
  applyStart: string;
  applyEnd: string;
  programStart: string;
  programEnd: string;
  location: string;
  fee: number;
  organizerId: string;
  organizer?: {
    id: string;
    name: string;
  };
  imageUrl?: string;
  imageUrls?: string[];
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

const statusLabels = {
  draft: '기획중',
  open: '모집중',
  closed: '종료',
  archived: '보관',
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
      const data = response.data || response;
      setPrograms(data.programs || []);
    } catch (err) {
      setError('프로그램 목록을 불러오는데 실패했습니다.');
      console.error('Error fetching programs:', err);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            프로그램 목록
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            다양한 프로그램에 참여하여 새로운 경험을 쌓아보세요
          </p>
        </div>

        {/* 신청 가능한 프로그램 알림 */}
        {programs.some(isApplicationOpen) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  지금 신청 가능한 프로그램이 있습니다!
                </p>
                <p className="text-sm text-green-700">
                  아래에서 신청 가능한 프로그램을 확인하고 참여해보세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 프로그램 그리드 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              <Card key={program.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 overflow-hidden">
                <div className={`h-1 bg-gradient-to-r ${gradientColor}`}></div>
                
                {/* 이미지 영역 */}
                <div className="relative h-48 overflow-hidden">
                  {program.imageUrl ? (
                    <Image
                      src={program.imageUrl.startsWith('http') ? program.imageUrl : `https://nuvio.kr${program.imageUrl}`}
                      alt={program.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* 상태 배지 */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`${statusColors[program.status]} text-xs shadow-sm`}>
                      {statusLabels[program.status]}
                    </Badge>
                  </div>
                  
                  {/* 신청 가능 배지 */}
                  {isApplicationOpen(program) && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-500 text-white text-xs shadow-sm">
                        신청 가능
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* 콘텐츠 영역 */}
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                    {program.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {program.summary || program.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <Button 
                      asChild 
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Link href={`/programs/${program.id}`}>
                        자세히 보기
                      </Link>
                    </Button>
                    {isApplicationOpen(program) && user && (
                      <Button 
                        asChild 
                        size="sm"
                        variant="outline" 
                        className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                      >
                        <Link href={`/programs/${program.id}/apply`}>
                          신청하기
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <div className="col-span-full text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">프로그램이 없습니다</h3>
              <p className="text-gray-500">아직 등록된 프로그램이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}