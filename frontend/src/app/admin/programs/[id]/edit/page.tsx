'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';

const programSchema = z.object({
  title: z.string().min(1, '프로그램명을 입력해주세요'),
  description: z.string().min(1, '프로그램 설명을 입력해주세요'),
  status: z.enum(['draft', 'open', 'closed', 'archived']),
  maxParticipants: z.number().min(1, '최대 참여자 수를 입력해주세요'),
  applyStart: z.string().min(1, '신청 시작일을 입력해주세요'),
  applyEnd: z.string().min(1, '신청 마감일을 입력해주세요'),
  programStart: z.string().min(1, '프로그램 시작일을 입력해주세요'),
  programEnd: z.string().min(1, '프로그램 종료일을 입력해주세요'),
  location: z.string().min(1, '장소를 입력해주세요'),
  fee: z.number().min(0, '참가비는 0 이상이어야 합니다'),
  organizerId: z.string().min(1, '주최 기관을 선택해주세요'),
  imageUrl: z.string().optional(),
});

type ProgramFormData = z.infer<typeof programSchema>;

interface FormField {
  name: string;
  type: string;
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface Program {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'open' | 'closed' | 'archived';
  maxParticipants: number;
  applyStart: string;
  applyEnd: string;
  programStart: string;
  programEnd: string;
  location: string;
  fee: number;
  organizerId: string;
  applicationForm?: FormField[];
  metadata?: Record<string, unknown>;
}

export default function EditProgramPage() {
  const router = useRouter();
  const params = useParams();
  const { user, refreshUserProfile, loading } = useAuth();
  const programId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [program, setProgram] = useState<Program | null>(null);
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
  });

  const fetchProgram = useCallback(async () => {
    try {
      setIsLoadingData(true);
      const response = await apiClient.get<Program>(API_ENDPOINTS.PROGRAMS.DETAIL(programId));
      const data = response.data || response;
      setProgram(data);
      
      // 폼 데이터 설정
      reset({
        title: data.title,
        description: data.description,
        status: data.status,
        maxParticipants: data.maxParticipants,
        applyStart: data.applyStart ? new Date(data.applyStart).toISOString().slice(0, 16) : '',
        applyEnd: data.applyEnd ? new Date(data.applyEnd).toISOString().slice(0, 16) : '',
        programStart: data.programStart ? new Date(data.programStart).toISOString().slice(0, 16) : '',
        programEnd: data.programEnd ? new Date(data.programEnd).toISOString().slice(0, 16) : '',
        location: data.location,
        fee: data.fee,
        organizerId: data.organizerId,
      });

      // 신청서 양식 설정
      if (data.applicationForm) {
        if (Array.isArray(data.applicationForm)) {
          setFormFields(data.applicationForm);
        } else if (data.applicationForm && typeof data.applicationForm === 'object' && 'fields' in data.applicationForm) {
          setFormFields((data.applicationForm as { fields: FormField[] }).fields);
        }
      }
    } catch (error) {
      console.error('프로그램 조회 오류:', error);
      toast.error('프로그램 정보를 불러오는데 실패했습니다.');
      router.push('/admin/programs');
    } finally {
      setIsLoadingData(false);
    }
  }, [programId, router, reset]);

  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]);

  useEffect(() => {
    if (programId) {
      fetchProgram();
    }
  }, [programId, fetchProgram]);

  // 사용자 조직 ID가 있으면 자동으로 설정
  useEffect(() => {
    if (user?.organizationId) {
      setValue('organizerId', user.organizationId);
    }
  }, [user?.organizationId, setValue]);

  const onSubmit = async (data: ProgramFormData) => {
    setIsLoading(true);
    try {
      // organizerId는 업데이트하지 않음 (백엔드에서 제한됨)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { organizerId, ...updateData } = data;
      
      const programData = {
        ...updateData,
        applicationForm: { fields: formFields },
        metadata: {
          ...program?.metadata,
          updatedBy: 'admin',
          updatedAt: new Date().toISOString(),
        },
      };

      console.log('수정 전송 데이터:', programData);
      await apiClient.patch(API_ENDPOINTS.PROGRAMS.UPDATE(programId), programData);
      toast.success('프로그램이 성공적으로 수정되었습니다.');
      router.push('/admin/programs');
    } catch (error) {
      console.error('프로그램 수정 오류:', error);
      toast.error('프로그램 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const addFormField = () => {
    const newField: FormField = {
      name: `field_${Date.now()}`,
      type: 'text',
      label: '새 필드',
      description: '',
      required: true, // 기본값을 필수로 변경
      placeholder: '입력해주세요',
    };
    setFormFields([...formFields, newField]);
  };

  const updateFormField = (index: number, field: Partial<FormField>) => {
    const updatedFields = [...formFields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setFormFields(updatedFields);
  };

  const removeFormField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  // 로딩 중이면 로딩 표시
  if (loading || isLoadingData) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">프로그램 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 사용자 정보가 없거나 권한이 없으면 접근 거부
  if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-6">프로그램을 수정할 권한이 없습니다.</p>
          <Button onClick={() => router.back()}>뒤로가기</Button>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">프로그램을 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-4">요청하신 프로그램이 존재하지 않습니다.</p>
          <Button onClick={() => router.push('/admin/programs')}>
            프로그램 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">프로그램 수정</h1>
        </div>
        <p className="text-gray-600">{program.title} 프로그램을 수정합니다.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>프로그램의 기본 정보를 수정해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">프로그램명 *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="프로그램명을 입력해주세요"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">상태 *</Label>
                <Select 
                  value={watch('status') || ''} 
                  onValueChange={(value) => setValue('status', value as 'draft' | 'open' | 'closed' | 'archived')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="상태를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">기획중</SelectItem>
                    <SelectItem value="open">모집중</SelectItem>
                    <SelectItem value="closed">종료</SelectItem>
                    <SelectItem value="archived">보관</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">최대 참여자 수 *</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  {...register('maxParticipants', { valueAsNumber: true })}
                  placeholder="20"
                />
                {errors.maxParticipants && (
                  <p className="text-sm text-red-600">{errors.maxParticipants.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fee">참가비 (원)</Label>
                <Input
                  id="fee"
                  type="number"
                  {...register('fee', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.fee && (
                  <p className="text-sm text-red-600">{errors.fee.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">장소 *</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="프로그램 장소를 입력해주세요"
                />
                {errors.location && (
                  <p className="text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizerId">주최 기관 *</Label>
                <div className="relative">
                  <Input
                    id="organizerId"
                    value={user?.organization?.name || ''}
                    placeholder="주최 기관을 선택해주세요"
                    className="bg-gray-50"
                    readOnly
                  />
                  <input
                    type="hidden"
                    {...register('organizerId')}
                    value={user?.organizationId || ''}
                  />
                </div>
                {errors.organizerId && (
                  <p className="text-sm text-red-600">{errors.organizerId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>프로그램 이미지</Label>
                <ImageUpload
                  value={watch('imageUrl')}
                  onChange={(url) => setValue('imageUrl', url)}
                />
                <p className="text-xs text-gray-500">
                  프로그램을 대표하는 이미지를 업로드하세요 (선택사항)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">프로그램 설명 *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="프로그램에 대한 자세한 설명을 입력해주세요"
                rows={4}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 일정 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>일정 정보</CardTitle>
            <CardDescription>프로그램의 신청 및 진행 일정을 수정해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="applyStart">신청 시작일 *</Label>
                <Input
                  id="applyStart"
                  type="datetime-local"
                  {...register('applyStart')}
                />
                {errors.applyStart && (
                  <p className="text-sm text-red-600">{errors.applyStart.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="applyEnd">신청 마감일 *</Label>
                <Input
                  id="applyEnd"
                  type="datetime-local"
                  {...register('applyEnd')}
                />
                {errors.applyEnd && (
                  <p className="text-sm text-red-600">{errors.applyEnd.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="programStart">프로그램 시작일 *</Label>
                <Input
                  id="programStart"
                  type="datetime-local"
                  {...register('programStart')}
                />
                {errors.programStart && (
                  <p className="text-sm text-red-600">{errors.programStart.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="programEnd">프로그램 종료일 *</Label>
                <Input
                  id="programEnd"
                  type="datetime-local"
                  {...register('programEnd')}
                />
                {errors.programEnd && (
                  <p className="text-sm text-red-600">{errors.programEnd.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 신청서 양식 */}
        <Card>
          <CardHeader>
            <CardTitle>신청서 양식</CardTitle>
            <CardDescription>참여자가 작성할 신청서 양식을 수정해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">신청서 필드</h3>
              <Button type="button" onClick={addFormField} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                필드 추가
              </Button>
            </div>

            <div className="space-y-4">
              {formFields.map((field, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>필드명 *</Label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateFormField(index, { label: e.target.value })}
                        placeholder="필드명을 입력해주세요"
                      />
                      <p className="text-xs text-gray-500">
                        ID: {field.name} (자동 생성)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>설명</Label>
                      <Input
                        value={field.description || ''}
                        onChange={(e) => updateFormField(index, { description: e.target.value })}
                        placeholder="필드 설명 (선택사항)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>타입</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateFormField(index, { type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">텍스트</SelectItem>
                          <SelectItem value="textarea">긴 텍스트</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>필수 여부</Label>
                      <Select
                        value={field.required ? 'true' : 'false'}
                        onValueChange={(value) => updateFormField(index, { required: value === 'true' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">필수</SelectItem>
                          <SelectItem value="false">선택</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFormField(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </Button>
                  </div>
                </div>
              ))}

              {formFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>아직 추가된 신청서 필드가 없습니다.</p>
                  <p className="text-sm">위의 &quot;필드 추가&quot; 버튼을 클릭하여 필드를 추가해주세요.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? '저장 중...' : '프로그램 수정'}
          </Button>
        </div>
      </form>
    </div>
  );
}
