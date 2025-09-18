'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  RefreshCw, 
  Plus,
  Eye,
  Edit,
  Mail,
  Phone,
  Calendar,
  Flag
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { UserReportDialog } from '@/components/user-report-dialog';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
  phone?: string;
  isActive: boolean;
  reportCount?: number;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

const roleLabels: Record<string, string> = {
  admin: '관리자',
  operator: '운영자',
  applicant: '신청자',
  participant: '참여자',
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  operator: 'bg-blue-100 text-blue-800',
  applicant: 'bg-green-100 text-green-800',
  participant: 'bg-purple-100 text-purple-800',
};

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [reportDialog, setReportDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
  });

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/users?page=${page}&limit=20&search=${search}&sortBy=createdAt&sortOrder=DESC`);
      
      
      // API 응답이 성공적이고 데이터가 있는지 확인
      if (response.success && response.data && typeof response.data === 'object' && response.data !== null) {
        const data = response.data as { users?: User[]; pagination?: { totalPages?: number; total?: number } };
        if (Array.isArray(data.users)) {
          setUsers(data.users);
          setTotalPages(data.pagination?.totalPages || 1);
          setTotalUsers(data.pagination?.total || 0);
        } else {
          setUsers([]);
          setTotalPages(1);
          setTotalUsers(0);
        }
      } else {
        console.warn('예상치 못한 API 응답 구조:', response);
        setUsers([]);
        setTotalPages(1);
        setTotalUsers(0);
      }
    } catch (error) {
      console.error('회원 목록 조회 오류:', error);
      toast.error('회원 목록을 불러오는데 실패했습니다.');
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'operator') {
      fetchUsers(currentPage, searchTerm);
    }
  }, [user, currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1, searchTerm);
  };

  const handleRefresh = () => {
    fetchUsers(currentPage, searchTerm);
  };


  const handleReportUser = (userId: string, userName: string) => {
    setReportDialog({
      isOpen: true,
      userId,
      userName,
    });
  };

  const handleReportSuccess = () => {
    fetchUsers(currentPage, searchTerm);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자 권한이 필요한 페이지입니다.</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">회원 관리</h1>
            <p className="text-gray-600">전체 회원 목록을 확인하고 관리할 수 있습니다.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
            <Link href="/admin/users/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                새 회원 등록
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="이름 또는 이메일로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              검색
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 회원 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            전체 회원 ({totalUsers}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">회원 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              회원이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <Badge className={roleColors[user.role] || 'bg-gray-100 text-gray-800'}>
                          {roleLabels[user.role] || user.role}
                        </Badge>
                        {!user.isActive && (
                          <Badge className="bg-red-100 text-red-800">비활성</Badge>
                        )}
                        {user.reportCount && user.reportCount > 0 ? (
                          <Badge className="bg-orange-100 text-orange-800">
                            신고 {user.reportCount}건
                          </Badge>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {user.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </div>
                        {user.lastLoginAt && (
                          <div className="text-xs text-gray-500">
                            마지막 로그인: {new Date(user.lastLoginAt).toLocaleDateString('ko-KR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleReportUser(user.id, user.name)}
                      className="text-orange-600 hover:text-orange-700"
                      title="회원 신고"
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
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

      {/* 회원 신고 다이얼로그 */}
      <UserReportDialog
        isOpen={reportDialog.isOpen}
        onClose={() => setReportDialog({ isOpen: false, userId: '', userName: '' })}
        reportedUserId={reportDialog.userId}
        reportedUserName={reportDialog.userName}
        onSuccess={handleReportSuccess}
      />
    </div>
  );
}
