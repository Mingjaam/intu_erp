'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Flag, 
  Search, 
  RefreshCw,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface UserReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: string;
    name: string;
    email: string;
    organization?: {
      id: string;
      name: string;
    };
  };
  reportedUser?: {
    id: string;
    name: string;
    email: string;
  };
  reviewer?: {
    id: string;
    name: string;
    email: string;
  };
}


export default function UserReportsPage() {
  const { user } = useAuth();
  
  // 디버깅을 위한 로그
  console.log('UserReportsPage - Current user:', user);
  console.log('UserReportsPage - User role:', user?.role);
  const [reports, setReports] = useState<UserReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  const fetchReports = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      const params: Record<string, string | number> = { page, limit: 20 };
      if (search) params.search = search;
      
      const response = await apiClient.get('/user-reports', params);
      
      if (response.success && response.data) {
        const data = response.data as { reports?: UserReport[]; pagination?: { totalPages?: number; total?: number } };
        if (Array.isArray(data.reports)) {
          setReports(data.reports);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalReports(data.pagination?.total || 0);
        } else {
          setReports([]);
          setTotalPages(1);
          setTotalReports(0);
        }
      } else {
        console.warn('예상치 못한 API 응답 구조:', response);
        setReports([]);
        setTotalPages(1);
        setTotalReports(0);
      }
    } catch (error) {
      console.error('신고 목록 조회 오류:', error);
      toast.error('신고 목록을 불러오는데 실패했습니다.');
      setReports([]);
      setTotalPages(1);
      setTotalReports(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'operator' || user?.role === 'staff') {
      fetchReports(currentPage, searchTerm);
    }
  }, [user, currentPage, searchTerm]);

  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setCurrentPage(1);
  //   fetchReports(1, searchTerm, statusFilter);
  // };

  const handleRefresh = () => {
    fetchReports(currentPage, searchTerm);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`${userName} 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      await apiClient.delete(`/users/${userId}`);
      toast.success('회원이 삭제되었습니다.');
      fetchReports(currentPage, searchTerm);
    } catch (error) {
      console.error('회원 삭제 오류:', error);
      toast.error('회원 삭제에 실패했습니다.');
    }
  };


  // 관리자와 운영자만 접근 가능
  if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자 또는 운영자 권한이 필요한 페이지입니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">신고 회원</h1>
            <p className="text-gray-600">모든 마을의 회원 신고를 관리할 수 있습니다.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="신고자 또는 피신고자 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 신고 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flag className="h-5 w-5 mr-2" />
            회원 신고 목록 ({totalReports}건)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">신고 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              신고가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {report.reportedUser?.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({report.reportedUser?.email})
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-xs text-gray-600">
                      <div>
                        <strong>신고자:</strong> {report.reporter?.name}
                        {report.reporter?.organization && (
                          <span className="text-blue-600 ml-1">({report.reporter.organization.name})</span>
                        )}
                      </div>
                      <div>
                        <strong>사유:</strong> {report.reason}
                      </div>
                      <div>
                        <strong>신고일:</strong> {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                      </div>
                    </div>
                    
                    {report.description && (
                      <div className="mt-1 text-xs text-gray-500 truncate max-w-md">
                        {report.description}
                      </div>
                    )}
                  </div>
                  
                  {/* 삭제 버튼 - 관리자/운영자만 표시 */}
                  {(user?.role === 'admin' || user?.role === 'operator') && report.reportedUser && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(report.reportedUser!.id, report.reportedUser!.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                이전
              </Button>
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages} 페이지
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
