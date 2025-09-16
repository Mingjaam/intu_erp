'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Send } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { CreateProgramData } from '@/types/program';

export default function NewProgramPage() {
  const router = useRouter();
  const { user, refreshUserProfile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProgramData>({
    title: '',
    description: '',
    organizerId: '',
    status: 'draft',
    applyStart: '',
    applyEnd: '',
    applicationForm: {},
    metadata: {},
  });


  const handleInputChange = (field: keyof CreateProgramData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (status: 'draft' | 'open') => {
    if (!formData.title || !formData.applyStart || !formData.applyEnd) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        ...formData,
        status,
      };

      await apiClient.post(API_ENDPOINTS.PROGRAMS.CREATE, data);
      
      toast.success(status === 'draft' ? '프로그램이 임시저장되었습니다.' : '프로그램이 공개되었습니다.');
      router.push('/programs');
    } catch (error) {
      console.error('프로그램 생성 오류:', error);
      toast.error('프로그램 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };


  // 로딩 중이면 로딩 표시
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로딩 중...</h1>
        </div>
      </div>
    );
  }

  // 사용자 정보가 없거나 권한이 없으면 접근 거부
  if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-6">프로그램을 생성할 권한이 없습니다.</p>
          <Button asChild>
            <Link href="/programs">프로그램 목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/programs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">새 프로그램 생성</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>프로그램 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">프로그램 제목 *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="프로그램 제목을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">임시저장</SelectItem>
                    <SelectItem value="open">모집중</SelectItem>
                    <SelectItem value="closed">모집종료</SelectItem>
                    <SelectItem value="archived">보관됨</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">프로그램 설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="프로그램에 대한 자세한 설명을 입력하세요"
                rows={4}
              />
            </div>

            {/* 주최 기관 ID 필드 */}
            <div className="space-y-2">
              <Label htmlFor="organizerId">주최 기관 ID</Label>
              <Input
                id="organizerId"
                value={formData.organizerId}
                placeholder="주최 기관 ID를 입력하세요"
                disabled
                className="bg-gray-50 mb-2"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (user?.organizationId) {
                    setFormData(prev => ({
                      ...prev,
                      organizerId: user.organizationId || '',
                    }));
                  }
                }}
                className="w-full"
              >
                자동 입력
              </Button>
              {user?.organization && (
                <p className="text-sm text-gray-500">
                  사용 가능한 조직: {user.organization.name} ({user.organization.type})
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="applyStart">신청 시작일 *</Label>
                <Input
                  id="applyStart"
                  type="datetime-local"
                  value={formData.applyStart}
                  onChange={(e) => handleInputChange('applyStart', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="applyEnd">신청 종료일 *</Label>
                <Input
                  id="applyEnd"
                  type="datetime-local"
                  value={formData.applyEnd}
                  onChange={(e) => handleInputChange('applyEnd', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                임시저장
              </Button>
              <Button
                onClick={() => handleSubmit('open')}
                disabled={isLoading}
              >
                <Send className="h-4 w-4 mr-2" />
                공개하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
