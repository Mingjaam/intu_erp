'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Users,
  Building2,
  Activity,
  TrendingUp,
  Eye,
  Plus,
  Search,
  Shield,
  RefreshCw,
  BarChart3,
} from 'lucide-react';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalPrograms: number;
    activePrograms: number;
    totalApplications: number;
    totalSelections: number;
    totalVisits: number;
    totalOrganizations: number;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  organization?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  address?: string;
  contact?: string;
  description?: string;
}

export default function SuperDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  
  // 마을 생성 다이얼로그
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: '',
    type: 'village' as 'village' | 'center' | 'other',
    address: '',
    contact: '',
    description: '',
  });

  // 운영자 추가 다이얼로그
  const [isAddOperatorOpen, setIsAddOperatorOpen] = useState(false);
  const [operatorUserId, setOperatorUserId] = useState('');

  // 권한 확인
  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('관리자만 접근할 수 있는 페이지입니다.');
      window.location.href = '/admin';
    }
  }, [user]);

  // 통계 데이터 로드
  const fetchStats = async () => {
    try {
      const response = await apiClient.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS);
      const data = response.data || response;
      setStats(data);
    } catch (error) {
      console.error('통계 조회 오류:', error);
      toast.error('통계 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 목록 로드
  const fetchUsers = async () => {
    try {
      const response = await apiClient.get<{ users: User[]; total: number }>(API_ENDPOINTS.USERS.LIST);
      const data = response.data || response;
      const usersList = Array.isArray(data) ? data : (data as any).users || [];
      setUsers(usersList);
    } catch (error) {
      console.error('사용자 목록 조회 오류:', error);
      toast.error('사용자 목록을 불러오는데 실패했습니다.');
    }
  };

  // 조직 목록 로드
  const fetchOrganizations = async () => {
    try {
      const response = await apiClient.get<{ organizations: Organization[]; total: number }>(
        API_ENDPOINTS.ORGANIZATIONS.LIST
      );
      const data = response.data || response;
      const orgsList = Array.isArray(data) ? data : (data as any).organizations || [];
      setOrganizations(orgsList);
    } catch (error) {
      console.error('조직 목록 조회 오류:', error);
      toast.error('조직 목록을 불러오는데 실패했습니다.');
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchStats();
      fetchUsers();
      fetchOrganizations();
    }
  }, [user]);

  // 마을 생성
  const handleCreateOrganization = async () => {
    if (!newOrg.name.trim()) {
      toast.error('마을 이름을 입력해주세요.');
      return;
    }

    try {
      await apiClient.post(API_ENDPOINTS.ORGANIZATIONS.CREATE, newOrg);
      toast.success('마을이 성공적으로 생성되었습니다.');
      setIsCreateOrgOpen(false);
      setNewOrg({
        name: '',
        type: 'village',
        address: '',
        contact: '',
        description: '',
      });
      fetchOrganizations();
    } catch (error) {
      console.error('마을 생성 오류:', error);
      toast.error('마을 생성에 실패했습니다.');
    }
  };

  // 운영자 추가
  const handleAddOperator = async () => {
    if (!operatorUserId || !selectedOrganization) {
      toast.error('사용자와 마을을 선택해주세요.');
      return;
    }

    try {
      await apiClient.patch(API_ENDPOINTS.USERS.CHANGE_ROLE(operatorUserId), {
        role: 'operator',
        organizationId: selectedOrganization,
      });
      toast.success('운영자가 성공적으로 추가되었습니다.');
      setIsAddOperatorOpen(false);
      setOperatorUserId('');
      setSelectedOrganization('');
      fetchUsers();
    } catch (error) {
      console.error('운영자 추가 오류:', error);
      toast.error('운영자 추가에 실패했습니다.');
    }
  };

  // 검색 필터링
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
              <p className="text-gray-600">전체 시스템 통계 및 관리</p>
            </div>
            <Button onClick={fetchStats} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">전체 회원 수</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.overview.totalUsers.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">마을 수</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.overview.totalOrganizations.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">전체 프로그램</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.overview.totalPrograms.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">전체 신청서</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.overview.totalApplications.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-orange-100 rounded-full p-3">
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 추가 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">활성 프로그램</h3>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.overview.activePrograms.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">선정된 신청자</h3>
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.overview.totalSelections.toLocaleString() || 0}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">방문 기록</h3>
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats?.overview.totalVisits.toLocaleString() || 0}
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Button
            onClick={() => setIsCreateOrgOpen(true)}
            className="h-24 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Plus className="h-6 w-6 mr-2" />
            마을 생성
          </Button>
          <Button
            onClick={() => setIsAddOperatorOpen(true)}
            className="h-24 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <Shield className="h-6 w-6 mr-2" />
            마을에 운영자 추가
          </Button>
        </div>

        {/* 회원 조회 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">회원 조회</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="이름 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">이름</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">이메일</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">역할</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">소속 마을</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">가입일</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedUser(user)}
                    >
                      <td className="py-3 px-4 text-gray-900">{user.name}</td>
                      <td className="py-3 px-4 text-gray-600">{user.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : user.role === 'operator'
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'staff'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role === 'admin'
                            ? '관리자'
                            : user.role === 'operator'
                            ? '운영자'
                            : user.role === 'staff'
                            ? '직원'
                            : '신청자'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {user.organization?.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 마을 생성 다이얼로그 */}
        <Dialog open={isCreateOrgOpen} onOpenChange={setIsCreateOrgOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>마을 생성</DialogTitle>
              <DialogDescription>새로운 마을을 생성합니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="org-name">마을 이름 *</Label>
                <Input
                  id="org-name"
                  value={newOrg.name}
                  onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                  placeholder="마을 이름을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-type">마을 유형 *</Label>
                <Select
                  value={newOrg.type}
                  onValueChange={(value: 'village' | 'center' | 'other') =>
                    setNewOrg({ ...newOrg, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="village">마을</SelectItem>
                    <SelectItem value="center">센터</SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-address">주소</Label>
                <Input
                  id="org-address"
                  value={newOrg.address}
                  onChange={(e) => setNewOrg({ ...newOrg, address: e.target.value })}
                  placeholder="주소를 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-contact">연락처</Label>
                <Input
                  id="org-contact"
                  value={newOrg.contact}
                  onChange={(e) => setNewOrg({ ...newOrg, contact: e.target.value })}
                  placeholder="연락처를 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-description">설명</Label>
                <Textarea
                  id="org-description"
                  value={newOrg.description}
                  onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                  placeholder="마을에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOrgOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreateOrganization}>생성</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 운영자 추가 다이얼로그 */}
        <Dialog open={isAddOperatorOpen} onOpenChange={setIsAddOperatorOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>마을에 운영자 추가</DialogTitle>
              <DialogDescription>사용자를 선택한 마을의 운영자로 지정합니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user-select">사용자 선택 *</Label>
                <Select value={operatorUserId} onValueChange={setOperatorUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="사용자를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((u) => u.role !== 'admin' && u.role !== 'operator')
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-select">마을 선택 *</Label>
                <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
                  <SelectTrigger>
                    <SelectValue placeholder="마을을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name} ({org.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOperatorOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAddOperator}>추가</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 사용자 상세 다이얼로그 */}
        {selectedUser && (
          <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>사용자 정보</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">이름</Label>
                  <p className="text-lg font-semibold">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">이메일</Label>
                  <p className="text-lg">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">역할</Label>
                  <p className="text-lg">
                    {selectedUser.role === 'admin'
                      ? '관리자'
                      : selectedUser.role === 'operator'
                      ? '운영자'
                      : selectedUser.role === 'staff'
                      ? '직원'
                      : '신청자'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">소속 마을</Label>
                  <p className="text-lg">{selectedUser.organization?.name || '-'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">가입일</Label>
                  <p className="text-lg">
                    {new Date(selectedUser.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setSelectedUser(null)}>닫기</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}

