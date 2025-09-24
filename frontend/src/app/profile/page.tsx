'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Save,
  Edit3,
  X
} from 'lucide-react';
import { toast } from 'sonner';

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

export default function ProfilePage() {
  const { user, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      await apiClient.patch(API_ENDPOINTS.USERS.UPDATE_PROFILE, formData);
      toast.success('프로필이 업데이트되었습니다.');
      await refreshUserProfile();
      setIsEditing(false);
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      toast.error('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600">프로필을 보려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">내 프로필</h1>
        <p className="text-gray-600">개인 정보를 확인하고 수정할 수 있습니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 프로필 정보 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  기본 정보
                </CardTitle>
                {!isEditing ? (
                  <Button onClick={handleEdit} size="sm">
                    <Edit3 className="h-4 w-4 mr-2" />
                    수정
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave} 
                      size="sm" 
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </Button>
                    <Button onClick={handleCancel} size="sm" variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      취소
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="이름을 입력하세요"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>{user.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="이메일을 입력하세요"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{user.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="전화번호를 입력하세요"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{user.phone || '전화번호가 없습니다'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>역할</Label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <Badge className={roleColors[user.role] || 'bg-gray-100 text-gray-800'}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 사이드 정보 */}
        <div className="space-y-6">
          {/* 조직 정보 */}
          {user.organization && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  조직 정보
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">조직명</Label>
                    <p className="text-sm text-gray-900">{user.organization.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">조직 유형</Label>
                    <p className="text-sm text-gray-900">{user.organization.type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 계정 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                계정 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">가입일</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                {user.lastLoginAt && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">마지막 로그인</Label>
                    <p className="text-sm text-gray-900">
                      {new Date(user.lastLoginAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium text-gray-700">계정 상태</Label>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-gray-900">
                      {user.isActive ? '활성' : '비활성'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
