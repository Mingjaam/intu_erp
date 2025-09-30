'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Building, 
  Users, 
  Edit, 
  Save, 
  X, 
  UserCog, 
  MessageSquare,
  RefreshCw,
  MapPin,
  Phone,
  FileText,
  Plus,
  Search
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

interface VillageInfo {
  id: string;
  name: string;
  address?: string;
  contact?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VillageMember {
  id: string;
  name: string;
  email: string;
  role: string;
  memo?: string;
  createdAt: string;
}

interface SearchUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  organizationId?: string;
}

export default function VillageManagePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [villageInfo, setVillageInfo] = useState<VillageInfo | null>(null);
  const [members, setMembers] = useState<VillageMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    contact: '',
    description: ''
  });
  const [memberMemo, setMemberMemo] = useState<{ [key: string]: string }>({});
  const [memoDialog, setMemoDialog] = useState<{
    isOpen: boolean;
    memberId: string;
    memberName: string;
    currentMemo: string;
  }>({
    isOpen: false,
    memberId: '',
    memberName: '',
    currentMemo: ''
  });
  
  // 직원 추가 관련 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDialog, setSearchDialog] = useState<{
    isOpen: boolean;
    selectedUser: SearchUser | null;
    newRole: string;
  }>({
    isOpen: false,
    selectedUser: null,
    newRole: 'staff'
  });

  const fetchVillageInfo = useCallback(async () => {
    if (!user?.organizationId) return;
    
    try {
      setIsLoading(true);
      const response = await apiClient.get(`${API_ENDPOINTS.ORGANIZATIONS.GET(user.organizationId)}`);
      const data = response.data || response;
      setVillageInfo(data);
      setEditForm({
        name: data.name || '',
        address: data.address || '',
        contact: data.contact || '',
        description: data.description || ''
      });
    } catch (error) {
      console.error('마을 정보 조회 오류:', error);
      toast.error('마을 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.organizationId]);

  const fetchVillageMembers = useCallback(async () => {
    if (!user?.organizationId) return;
    
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.ORGANIZATIONS.GET(user.organizationId)}`);
      const data = response.data || response;
      setMembers(data.users || []);
    } catch (error) {
      console.error('마을 직원 조회 오류:', error);
      toast.error('마을 직원 정보를 불러오는데 실패했습니다.');
    }
  }, [user?.organizationId]);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'operator') {
      fetchVillageInfo();
      fetchVillageMembers();
    } else {
      router.push('/admin'); // 권한이 없는 경우 리다이렉트
    }
  }, [user, fetchVillageInfo, fetchVillageMembers, router]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: villageInfo?.name || '',
      address: villageInfo?.address || '',
      contact: villageInfo?.contact || '',
      description: villageInfo?.description || ''
    });
  };

  const handleSave = async () => {
    if (!user?.organizationId) return;
    
    try {
      await apiClient.patch(API_ENDPOINTS.ORGANIZATIONS.UPDATE(user.organizationId), editForm);
      toast.success('마을 정보가 수정되었습니다.');
      setIsEditing(false);
      fetchVillageInfo();
    } catch (error) {
      console.error('마을 정보 수정 오류:', error);
      toast.error('마을 정보 수정에 실패했습니다.');
    }
  };

  const openMemoDialog = (memberId: string, memberName: string, currentMemo: string) => {
    setMemoDialog({
      isOpen: true,
      memberId,
      memberName,
      currentMemo
    });
    setMemberMemo({ [memberId]: currentMemo });
  };

  const closeMemoDialog = () => {
    setMemoDialog({
      isOpen: false,
      memberId: '',
      memberName: '',
      currentMemo: ''
    });
    setMemberMemo({});
  };

  const handleMemoSave = async () => {
    try {
      await apiClient.patch(API_ENDPOINTS.USERS.UPDATE(memoDialog.memberId), {
        memo: memberMemo[memoDialog.memberId] || ''
      });
      toast.success('메모가 저장되었습니다.');
      closeMemoDialog();
      fetchVillageMembers();
    } catch (error) {
      console.error('메모 저장 오류:', error);
      toast.error('메모 저장에 실패했습니다.');
    }
  };

  // 사용자 검색
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('검색어를 입력해주세요.');
      return;
    }

    try {
      setIsSearching(true);
      const response = await apiClient.get(`${API_ENDPOINTS.USERS.LIST}?search=${encodeURIComponent(searchTerm.trim())}&page=1&limit=20`);
      const data = response.data || response;
      setSearchResults(data.users || []);
      
      if (data.users && data.users.length === 0) {
        toast.info('검색 결과가 없습니다.');
      }
    } catch (error) {
      console.error('사용자 검색 오류:', error);
      toast.error('사용자 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 검색 결과에서 사용자 선택
  const handleSelectUser = (selectedUser: SearchUser) => {
    setSearchDialog({
      isOpen: true,
      selectedUser,
      newRole: 'staff'
    });
  };

  // 직원 추가 (역할 변경)
  const handleAddMember = async () => {
    if (!searchDialog.selectedUser || !user?.organizationId) return;

    try {
      await apiClient.patch(API_ENDPOINTS.USERS.CHANGE_ROLE(searchDialog.selectedUser.id), {
        role: searchDialog.newRole,
        organizationId: user.organizationId
      });
      
      toast.success(`${searchDialog.selectedUser.name}님이 ${getRoleLabel(searchDialog.newRole)}로 추가되었습니다.`);
      setSearchDialog({
        isOpen: false,
        selectedUser: null,
        newRole: 'staff'
      });
      setSearchTerm('');
      setSearchResults([]);
      fetchVillageMembers();
    } catch (error) {
      console.error('직원 추가 오류:', error);
      toast.error('직원 추가에 실패했습니다.');
    }
  };

  const closeSearchDialog = () => {
    setSearchDialog({
      isOpen: false,
      selectedUser: null,
      newRole: 'staff'
    });
  };

  const getRoleLabel = (role: string) => {
    const roleLabels = {
      admin: '관리자',
      operator: '운영자',
      staff: '직원',
      applicant: '신청자'
    };
    return roleLabels[role as keyof typeof roleLabels] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      operator: 'bg-blue-100 text-blue-800',
      staff: 'bg-green-100 text-green-800',
      applicant: 'bg-gray-100 text-gray-800'
    };
    return roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800';
  };

  if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">운영자 이상의 권한이 필요한 페이지입니다.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">마을 정보를 불러오는 중...</p>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">마을 및 직원 관리</h1>
            <p className="text-gray-600">마을 정보를 수정하고 소속 직원을 관리할 수 있습니다.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={fetchVillageInfo} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
            {!isEditing ? (
              <Button onClick={handleEdit} size="sm">
                <Edit className="h-4 w-4 mr-2" />
                마을 정보 수정
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  취소
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 마을 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              마을 정보
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">마을 이름</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="마을 이름을 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="address">주소</Label>
                  <Input
                    id="address"
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="주소를 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="contact">연락처</Label>
                  <Input
                    id="contact"
                    value={editForm.contact}
                    onChange={(e) => setEditForm(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="연락처를 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="마을에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{villageInfo?.name}</h3>
                </div>
                {villageInfo?.address && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{villageInfo.address}</span>
                  </div>
                )}
                {villageInfo?.contact && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{villageInfo.contact}</span>
                  </div>
                )}
                {villageInfo?.description && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <FileText className="h-4 w-4 mt-1" />
                    <span>{villageInfo.description}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 직원 추가 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              직원 추가
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="searchTerm">사용자 검색</Label>
                <div className="flex gap-2">
                  <Input
                    id="searchTerm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="이름, 전화번호, 이메일로 검색"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <p className="text-sm font-medium text-gray-700">검색 결과:</p>
                  {searchResults.every(user => user.organizationId !== null) && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        검색된 모든 사용자가 이미 다른 마을에 소속되어 있습니다.
                      </p>
                    </div>
                  )}
                  {searchResults.map((searchUser) => (
                    <div 
                      key={searchUser.id} 
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        searchUser.organizationId !== null 
                          ? 'bg-red-50 border border-red-200' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${
                            searchUser.organizationId !== null ? 'text-red-700' : 'text-gray-900'
                          }`}>
                            {searchUser.name}
                          </h4>
                          <Badge className={getRoleColor(searchUser.role)}>
                            {getRoleLabel(searchUser.role)}
                          </Badge>
                          {searchUser.organizationId !== null && (
                            <Badge className="bg-red-100 text-red-800">
                              {searchUser.organizationId === user?.organizationId ? '이미 소속' : '다른 마을 소속'}
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${
                          searchUser.organizationId !== null ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {searchUser.email}
                        </p>
                        {searchUser.phone && (
                          <p className={`text-sm ${
                            searchUser.organizationId !== null ? 'text-red-500' : 'text-gray-500'
                          }`}>
                            {searchUser.phone}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSelectUser(searchUser)}
                        disabled={searchUser.organizationId !== null}
                      >
                        {searchUser.organizationId === user?.organizationId 
                          ? '이미 소속' 
                          : searchUser.organizationId !== null 
                            ? '다른 마을 소속' 
                            : '선택'
                        }
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 마을 직원 리스트 */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              마을 직원 ({members.length}명)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{member.name}</h4>
                      <Badge className={getRoleColor(member.role)}>
                        {getRoleLabel(member.role)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-600">{member.email}</p>
                      {member.memo && (
                        <span className="text-sm text-gray-500">• {member.memo}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openMemoDialog(member.id, member.name, member.memo || '')}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {members.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  등록된 직원이 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 직원 추가 다이얼로그 */}
      <Dialog open={searchDialog.isOpen} onOpenChange={closeSearchDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>직원 추가</DialogTitle>
          </DialogHeader>
          
          {searchDialog.selectedUser && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="selectedUserName">선택된 사용자</Label>
                <Input
                  id="selectedUserName"
                  value={searchDialog.selectedUser.name}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-sm text-gray-600 mt-1">{searchDialog.selectedUser.email}</p>
              </div>
              
              <div>
                <Label htmlFor="newRole">역할 선택</Label>
                <select
                  id="newRole"
                  value={searchDialog.newRole}
                  onChange={(e) => setSearchDialog(prev => ({ ...prev, newRole: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="staff">직원</option>
                  <option value="operator">운영자</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {searchDialog.newRole === 'operator' ? '운영자로 추가하면 마을 관리 권한을 갖게 됩니다.' : '직원으로 추가됩니다.'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeSearchDialog}>
              취소
            </Button>
            <Button onClick={handleAddMember}>
              추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 메모 다이얼로그 */}
      <Dialog open={memoDialog.isOpen} onOpenChange={closeMemoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>직원 메모</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="memberName">직원</Label>
              <Input
                id="memberName"
                value={memoDialog.memberName}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="memo">메모</Label>
              <Textarea
                id="memo"
                value={memberMemo[memoDialog.memberId] || ''}
                onChange={(e) => setMemberMemo(prev => ({ 
                  ...prev, 
                  [memoDialog.memberId]: e.target.value 
                }))}
                placeholder="직원에 대한 메모를 입력하세요"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeMemoDialog}>
              취소
            </Button>
            <Button onClick={handleMemoSave}>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
