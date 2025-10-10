'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  RefreshCw, 
  UserCog,
  Mail,
  Phone,
  Calendar,
  Flag,
  Building
} from 'lucide-react';
import { toast } from 'sonner';
import { UserReportDialog } from '@/components/user-report-dialog';

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

export default function UserManagePage() {
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

  const [roleChangeDialog, setRoleChangeDialog] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    currentRole: string;
  }>({
    isOpen: false,
    userId: '',
    userName: '',
    currentRole: '',
  });


  const [newRole, setNewRole] = useState<string>('');
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>('');
  const [organizations, setOrganizations] = useState<Array<{id: string; name: string; type: string}>>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.MANAGEABLE}?page=${page}&limit=20&search=${search}&sortBy=createdAt&sortOrder=DESC`);
      
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

  const fetchOrganizations = async () => {
    try {
      setIsLoadingOrganizations(true);
      const response = await apiClient.get(`${API_ENDPOINTS.ORGANIZATIONS.LIST}?page=1&limit=100`);
      const data = response.data || response;
      setOrganizations((data as { organizations?: Array<{id: string; name: string; type: string}> }).organizations || []);
    } catch (error) {
      console.error('조직 목록 조회 오류:', error);
      toast.error('조직 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingOrganizations(false);
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

  const openRoleChangeDialog = (userId: string, userName: string, currentRole: string) => {
    setRoleChangeDialog({
      isOpen: true,
      userId,
      userName,
      currentRole,
    });
    setNewRole(currentRole);
    setSelectedOrganizationId('');
    // 운영자로 승급하는 경우 조직 목록 조회
    if (currentRole !== 'operator') {
      fetchOrganizations();
    }
  };

  const closeRoleChangeDialog = () => {
    setRoleChangeDialog({
      isOpen: false,
      userId: '',
      userName: '',
      currentRole: '',
    });
    setNewRole('');
  };


  const handleRoleChange = async () => {
    if (!roleChangeDialog.userId || !newRole) return;

    try {
      const requestData: { role: string; organizationId?: string } = { role: newRole };
      
      // 운영자로 승급하는 경우 조직 ID 포함
      if (newRole === 'operator' && selectedOrganizationId) {
        requestData.organizationId = selectedOrganizationId;
      }
      
      console.log('역할 변경 요청:', {
        userId: roleChangeDialog.userId,
        newRole: newRole,
        organizationId: selectedOrganizationId,
        url: API_ENDPOINTS.USERS.CHANGE_ROLE(roleChangeDialog.userId)
      });
      
      const response = await apiClient.patch(API_ENDPOINTS.USERS.CHANGE_ROLE(roleChangeDialog.userId), requestData);
      
      console.log('역할 변경 응답:', response);
      toast.success('사용자 역할이 변경되었습니다.');
      closeRoleChangeDialog();
      fetchUsers(currentPage, searchTerm);
    } catch (error) {
      console.error('역할 변경 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      console.error('오류 상세:', {
        message: errorMessage,
        error: error
      });
      toast.error(`역할 변경에 실패했습니다: ${errorMessage}`);
    }
  };

  const getAvailableRoles = () => {
    if (user?.role === 'admin') {
      // 관리자는 운영자, 직원, 신청자만 부여 가능 (관리자 제외)
      return [
        { value: 'operator', label: '운영자' },
        { value: 'staff', label: '직원' },
        { value: 'applicant', label: '신청자' },
      ];
    } else if (user?.role === 'operator') {
      // 운영자는 운영자, 직원, 신청자만 부여 가능
      return [
        { value: 'operator', label: '운영자' },
        { value: 'staff', label: '직원' },
        { value: 'applicant', label: '신청자' },
      ];
    }
    return [];
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">관리</h1>
            <p className="text-gray-600">역할 변경이 가능한 회원을 관리할 수 있습니다.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
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
            관리 가능한 회원 ({totalUsers}명)
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
              관리 가능한 회원이 없습니다.
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
                        {user.organization && (
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {user.organization.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* 관리자 역할은 변경 불가 */}
                    {user.role !== 'admin' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openRoleChangeDialog(user.id, user.name, user.role)}
                        className="text-blue-600 hover:text-blue-700"
                        title="역할 변경"
                      >
                        <UserCog className="h-4 w-4" />
                      </Button>
                    )}
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

      {/* 역할 변경 다이얼로그 */}
      <Dialog open={roleChangeDialog.isOpen} onOpenChange={closeRoleChangeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>사용자 역할 변경</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* 사용자 정보 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCog className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {roleChangeDialog.userName}
              </h3>
              <p className="text-sm text-gray-600">
                현재 역할: {roleLabels[roleChangeDialog.currentRole] || roleChangeDialog.currentRole}
              </p>
            </div>

            {/* 역할 선택 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                새로운 역할
              </label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="역할을 선택하세요" />
                </SelectTrigger>
                  <SelectContent>
                    {getAvailableRoles().map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>

            {/* 운영자 승급 시 조직 선택 */}
            {newRole === 'operator' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  소속 조직 선택
                </label>
                <Select 
                  value={selectedOrganizationId} 
                  onValueChange={setSelectedOrganizationId}
                  disabled={isLoadingOrganizations}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingOrganizations ? "조직 목록을 불러오는 중..." : "조직을 선택하세요"} />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name} ({org.type === 'village' ? '마을' : org.type === 'company' ? '기업' : org.type === 'institution' ? '기관' : '비영리단체'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  운영자는 선택한 조직의 관리 권한을 갖게 됩니다.
                </p>
              </div>
            )}

            {/* 안내 메시지 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                {user?.role === 'admin' 
                  ? '관리자는 모든 사용자의 역할을 변경할 수 있습니다.'
                  : '운영자는 같은 조직의 사용자만 직원으로 변경할 수 있습니다.'
                }
              </p>
              {newRole === 'operator' && (
                <p className="text-sm text-blue-600 mt-2">
                  💡 운영자로 승급하면 선택한 조직의 관리 권한을 갖게 됩니다.
                </p>
              )}
              {newRole === 'staff' && (
                <p className="text-sm text-blue-600 mt-2">
                  💡 직원으로 변경하면 부여한 사람의 조직으로 이동됩니다.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeRoleChangeDialog}>
              취소
            </Button>
            <Button 
              onClick={handleRoleChange}
              disabled={
                !newRole || 
                newRole === roleChangeDialog.currentRole ||
                (newRole === 'operator' && !selectedOrganizationId)
              }
            >
              역할 변경
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
