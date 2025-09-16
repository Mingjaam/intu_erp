'use client';

import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Program {
  id: string;
  title: string;
  description: string;
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
  applicationCount?: number;
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
  // const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<{ programs: Program[]; total: number }>(
        API_ENDPOINTS.PROGRAMS.LIST
      );
      const data = response.data || response;
      setPrograms(data.programs || []);
    } catch (error) {
      console.error('프로그램 목록 조회 오류:', error);
      toast.error('프로그램 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 프로그램을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await apiClient.delete(API_ENDPOINTS.PROGRAMS.DELETE(id));
      toast.success('프로그램이 삭제되었습니다.');
      fetchPrograms();
    } catch (error) {
      console.error('프로그램 삭제 오류:', error);
      toast.error('프로그램 삭제에 실패했습니다.');
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || program.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">프로그램 목록을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">프로그램 관리</h1>
          <Link href="/admin/programs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 프로그램
            </Button>
          </Link>
        </div>
        <p className="text-gray-600">프로그램을 생성, 수정, 삭제하고 관리하세요.</p>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="프로그램명 또는 설명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">전체 상태</option>
                <option value="draft">기획중</option>
                <option value="open">모집중</option>
                <option value="closed">종료</option>
                <option value="archived">보관</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 프로그램 목록 */}
      <div className="space-y-4">
        {filteredPrograms.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">프로그램이 없습니다</h3>
              <p className="text-gray-600 mb-4">아직 등록된 프로그램이 없습니다.</p>
              <Link href="/admin/programs/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  첫 번째 프로그램 만들기
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredPrograms.map((program) => (
            <Card key={program.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{program.title}</h3>
                      <Badge className={statusColors[program.status]}>
                        {statusLabels[program.status]}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-2">{program.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">최대 참여자:</span> {program.maxParticipants}명
                      </div>
                      <div>
                        <span className="font-medium">현재 신청자:</span> {program.applicationCount || 0}명
                      </div>
                      <div>
                        <span className="font-medium">참가비:</span> ₩{program.fee.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">장소:</span> {program.location}
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium">신청 기간:</span>{' '}
                          {new Date(program.applyStart).toLocaleDateString()} ~ {new Date(program.applyEnd).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">프로그램 기간:</span>{' '}
                          {new Date(program.programStart).toLocaleDateString()} ~ {new Date(program.programEnd).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/programs/${program.id}`}>
                      <Button variant="outline" size="sm" title="프로그램 상세보기">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/programs/${program.id}/applications`}>
                      <Button variant="outline" size="sm" title="신청자 목록">
                        <Users className="h-4 w-4 mr-1" />
                        {program.applicationCount || 0}
                      </Button>
                    </Link>
                    <Link href={`/admin/programs/${program.id}/edit`}>
                      <Button variant="outline" size="sm" title="프로그램 수정">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(program.id)}
                      className="text-red-600 hover:text-red-700"
                      title="프로그램 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 페이지네이션 */}
      {filteredPrograms.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              이전
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
