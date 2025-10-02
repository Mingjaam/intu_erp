'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  RefreshCw, 
  Mail,
  Phone,
  UserCog,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    type: string;
  };
  phone?: string;
  isActive: boolean;
  reportCount?: number;
  lastLoginAt?: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
}

const roleLabels: Record<string, string> = {
  admin: '관리자',
  operator: '운영자',
  staff: '직원',
  applicant: '신청자',
  participant: '참여자',
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  operator: 'bg-blue-100 text-blue-800',
  staff: 'bg-yellow-100 text-yellow-800',
  applicant: 'bg-green-100 text-green-800',
  participant: 'bg-purple-100 text-purple-800',
};

export default function StaffManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [editingMemo, setEditingMemo] = useState<string | null>(null);
  const [memoText, setMemoText] = useState('');

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.STAFF}?page=${page}&limit=20&sortBy=createdAt&sortOrder=DESC`);
      
      console.log('직원 관리 API 응답:', response);
      
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
      console.error('직원 목록 조회 오류:', error);
      toast.error('직원 목록을 불러오는데 실패했습니다.');
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'operator' || user?.role === 'staff') {
      fetchUsers(currentPage);
    }
  }, [user, currentPage]);

  const handleRefresh = () => {
    fetchUsers(currentPage);
  };

  const handleEditMemo = (userId: string, currentMemo: string = '') => {
    setEditingMemo(userId);
    setMemoText(currentMemo);
  };

  const handleCancelEdit = () => {
    setEditingMemo(null);
    setMemoText('');
  };

  const handleSaveMemo = async (userId: string) => {
    try {
      await apiClient.patch(API_ENDPOINTS.USERS.UPDATE_MEMO(userId), { memo: memoText });
      toast.success('메모가 저장되었습니다.');
      
      // 사용자 목록 업데이트
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, memo: memoText } : user
        )
      );
      
      setEditingMemo(null);
      setMemoText('');
    } catch (error) {
      console.error('메모 저장 오류:', error);
      toast.error('메모 저장에 실패했습니다.');
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'operator' && user.role !== 'staff')) {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">직원 관리</h1>
            <p className="text-gray-600">같은 마을의 운영자와 직원을 관리할 수 있습니다.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </div>
      </div>


      {/* 직원 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            직원 목록 ({totalUsers}명)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">직원 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              직원이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCog className="h-5 w-5 text-blue-600" />
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
                      </div>
                    </div>
                  </div>
                  
                  {/* 메모 영역 */}
                  <div className="mt-3">
                    {editingMemo === user.id ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">역할 메모</label>
                        <Textarea
                          value={memoText}
                          onChange={(e) => setMemoText(e.target.value)}
                          placeholder="마을 내에서의 역할이나 특이사항을 입력하세요..."
                          className="min-h-[80px]"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">역할 메모</label>
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md min-h-[60px]">
                          {user.memo || '메모가 없습니다. 편집 버튼을 클릭하여 메모를 추가하세요.'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editingMemo === user.id ? (
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSaveMemo(user.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditMemo(user.id, user.memo)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    )}
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
    </div>
  );
}
