'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Program, UpdateProgramData } from '@/types/program';

export default function EditProgramPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateProgramData>({
    title: '',
    description: '',
    status: 'draft',
    applyStart: '',
    applyEnd: '',
    applicationForm: {},
    metadata: {},
  });

  const programId = params.id as string;

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await apiClient.get<Program>(API_ENDPOINTS.PROGRAMS.DETAIL(programId));
        const program = response.data;
        
        setFormData({
          title: program.title,
          description: program.description || '',
          status: program.status,
          applyStart: program.applyStart.split('T')[0] + 'T' + program.applyStart.split('T')[1].substring(0, 5),
          applyEnd: program.applyEnd.split('T')[0] + 'T' + program.applyEnd.split('T')[1].substring(0, 5),
          applicationForm: program.applicationForm || {},
          metadata: program.metadata || {},
        });
      } catch (error) {
        console.error('프로그램 조회 오류:', error);
        toast.error('프로그램 정보를 불러오는데 실패했습니다.');
        router.push('/programs');
      } finally {
        setIsLoading(false);
      }
    };

    if (programId) {
      fetchProgram();
    }
  }, [programId, router]);

  const handleInputChange = (field: keyof UpdateProgramData, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.applyStart || !formData.applyEnd) {
      toast.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.patch(API_ENDPOINTS.PROGRAMS.UPDATE(programId), formData);
      
      toast.success('프로그램이 수정되었습니다.');
      router.push(`/programs/${programId}`);
    } catch (error) {
      console.error('프로그램 수정 오류:', error);
      toast.error('프로그램 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-6">프로그램을 수정할 권한이 없습니다.</p>
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
          <Link href={`/programs/${programId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            상세보기
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">프로그램 수정</h1>
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
                onClick={() => router.back()}
                disabled={isSaving}
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
