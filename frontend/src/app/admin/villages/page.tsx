'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building, 
  Search, 
  RefreshCw, 
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Phone,
  Mail,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { Organization } from '@/types/organization';

interface Village extends Organization {
  users?: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
  }>;
}

export default function VillagesPage() {
  const { user } = useAuth();
  const [villages, setVillages] = useState<Village[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVillages, setTotalVillages] = useState(0);
  
  // 다이얼로그 상태
  const [villageDialog, setVillageDialog] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    villageId?: string;
  }>({
    isOpen: false,
    mode: 'create'
  });
  
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    villageId: string;
    villageName: string;
  }>({
    isOpen: false,
    villageId: '',
    villageName: ''
  });
  
  const [membersDialog, setMembersDialog] = useState<{
    isOpen: boolean;
    villageId: string;
    villageName: string;
  }>({
    isOpen: false,
    villageId: '',
    villageName: ''
  });

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    type: 'village' as const,
    address: '',
    contact: '',
    description: ''
  });

  const fetchVillages = useCallback(async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`${API_ENDPOINTS.ORGANIZATIONS.LIST}?page=${page}&limit=20&search=${search}&sortBy=createdAt&sortOrder=DESC`);
      const data = response.data || response;
      setVillages(data.organizations || []);
      setTotalPages(data.totalPages || 1);
      setTotalVillages(data.total || 0);
    } catch (error) {
      console.error('마을 목록 조회 오류:', error);
      toast.error('마을 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchVillageMembers = async (villageId: string) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.ORGANIZATIONS.DETAIL(villageId)}`);
      const data = response.data || response;
      return data.users || [];
    } catch (error) {
      console.error('마을 회원 조회 오류:', error);
      return [];
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchVillages(currentPage, searchTerm);
    }
  }, [user, currentPage, searchTerm, fetchVillages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVillages(1, searchTerm);
  };

  const handleRefresh = () => {
    fetchVillages(currentPage, searchTerm);
  };

  const openCreateDialog = () => {
    setFormData({
      name: '',
      type: 'village',
      address: '',
      contact: '',
      description: ''
    });
    setVillageDialog({ isOpen: true, mode: 'create' });
  };

  const openEditDialog = (village: Village) => {
    setFormData({
      name: village.name,
      type: village.type as 'village',
      address: village.address || '',
      contact: village.contact || '',
      description: village.description || ''
    });
    setVillageDialog({ isOpen: true, mode: 'edit', villageId: village.id });
  };

  const openDeleteDialog = (village: Village) => {
    setDeleteDialog({
      isOpen: true,
      villageId: village.id,
      villageName: village.name
    });
  };

  const openMembersDialog = async (village: Village) => {
    setMembersDialog({
      isOpen: true,
      villageId: village.id,
      villageName: village.name
    });
  };

  const closeDialogs = () => {
    setVillageDialog({ isOpen: false, mode: 'create' });
    setDeleteDialog({ isOpen: false, villageId: '', villageName: '' });
    setMembersDialog({ isOpen: false, villageId: '', villageName: '' });
  };

  const handleSubmit = async () => {
    try {
      if (villageDialog.mode === 'create') {
        await apiClient.post(API_ENDPOINTS.ORGANIZATIONS.CREATE, formData);
        toast.success('마을이 생성되었습니다.');
      } else {
        await apiClient.patch(API_ENDPOINTS.ORGANIZATIONS.UPDATE(villageDialog.villageId!), formData);
        toast.success('마을 정보가 수정되었습니다.');
      }
      closeDialogs();
      fetchVillages(currentPage, searchTerm);
    } catch (error) {
      console.error('마을 저장 오류:', error);
      toast.error('마을 저장에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    try {
      await apiClient.delete(API_ENDPOINTS.ORGANIZATIONS.DELETE(deleteDialog.villageId));
      toast.success('마을이 삭제되었습니다.');
      closeDialogs();
      fetchVillages(currentPage, searchTerm);
    } catch (error) {
      console.error('마을 삭제 오류:', error);
      toast.error('마을 삭제에 실패했습니다.');
    }
  };

  if (!user || user.role !== 'admin') {
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">마을 관리</h1>
            <p className="text-gray-600">마을 정보를 관리하고 소속 회원을 확인할 수 있습니다.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleRefresh} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              마을 추가
            </Button>
          </div>
        </div>
      </div>

      {/* 검색 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="마을 이름으로 검색..."
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

      {/* 마을 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            마을 목록 ({totalVillages}개)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">마을 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : villages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              등록된 마을이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              {villages.map((village) => (
                <div key={village.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Building className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">{village.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        {village.address && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate max-w-xs">{village.address}</span>
                          </div>
                        )}
                        {village.contact && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate max-w-xs">{village.contact}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span>직원 {village.users?.length || 0}명</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openMembersDialog(village)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      회원 보기
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(village)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteDialog(village)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
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

      {/* 마을 추가/수정 다이얼로그 */}
      <Dialog open={villageDialog.isOpen} onOpenChange={closeDialogs}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {villageDialog.mode === 'create' ? '마을 추가' : '마을 수정'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">마을 이름</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="마을 이름을 입력하세요"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">주소</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="주소를 입력하세요"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">연락처</label>
              <Input
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                placeholder="연락처를 입력하세요"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">설명</label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="마을에 대한 설명을 입력하세요"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>
              취소
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
            >
              {villageDialog.mode === 'create' ? '추가' : '수정'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={closeDialogs}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>마을 삭제</DialogTitle>
          </DialogHeader>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              "{deleteDialog.villageName}" 마을을 삭제하시겠습니까?
            </p>
            <p className="text-sm text-gray-600">
              이 작업은 되돌릴 수 없습니다.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 회원 목록 다이얼로그 */}
      <Dialog open={membersDialog.isOpen} onOpenChange={closeDialogs}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{membersDialog.villageName} 소속 회원</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            <VillageMembersList villageId={membersDialog.villageId} />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialogs}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 마을 회원 목록 컴포넌트
function VillageMembersList({ villageId }: { villageId: string }) {
  const [members, setMembers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`${API_ENDPOINTS.ORGANIZATIONS.DETAIL(villageId)}`);
        const data = response.data || response;
        setMembers(data.users || []);
      } catch (error) {
        console.error('회원 목록 조회 오류:', error);
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (villageId) {
      fetchMembers();
    }
  }, [villageId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        소속 회원이 없습니다.
      </div>
    );
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

  return (
    <div className="space-y-3">
      {members.map((member) => (
        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <Badge className={roleColors[member.role]}>
                  {roleLabels[member.role]}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {member.email}
                </div>
                {member.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {member.phone}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
