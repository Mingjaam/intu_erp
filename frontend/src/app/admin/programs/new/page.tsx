'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';

const programSchema = z.object({
  title: z.string().min(1, '프로그램명을 입력해주세요'),
  summary: z.string().min(1, '한줄 설명을 입력해주세요'),
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

export default function NewProgramPage() {
  const router = useRouter();
  const { user, refreshUserProfile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([
    {
      name: 'name',
      type: 'text',
      label: '이름',
      description: '신청자 이름',
      required: true,
      placeholder: '이름을 입력해주세요',
    },
    {
      name: 'email',
      type: 'email',
      label: '이메일',
      description: '신청자 이메일',
      required: true,
      placeholder: '이메일을 입력해주세요',
    },
    {
      name: 'phone',
      type: 'tel',
      label: '전화번호',
      description: '신청자 전화번호',
      required: true,
      placeholder: '전화번호를 입력해주세요',
    },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      status: 'draft',
      maxParticipants: 20,
      fee: 0,
    },
  });

  // 사용자 정보 로드
  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]);

  // 사용자 조직 ID가 있으면 자동으로 설정
  useEffect(() => {
    if (user?.organizationId) {
      setValue('organizerId', user.organizationId);
    }
  }, [user?.organizationId, setValue]);

  const onSubmit = async (data: ProgramFormData) => {
    setIsLoading(true);
    try {
      const programData = {
        ...data,
        applicationForm: { fields: formFields },
        metadata: {
          createdBy: 'admin',
          version: '1.0',
        },
      };

      console.log('보내는 데이터:', programData);
      await apiClient.post(API_ENDPOINTS.PROGRAMS.CREATE, programData);
      toast.success('프로그램이 성공적으로 생성되었습니다.');
      router.push('/admin/programs');
    } catch (error) {
      console.error('프로그램 생성 오류:', error);
      toast.error('프로그램 생성에 실패했습니다.');
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
    // 기본 필드(이름, 이메일, 전화번호)는 수정할 수 없음
    const currentField = formFields[index];
    if (currentField && ['name', 'email', 'phone'].includes(currentField.name)) {
      toast.error('기본 필드(이름, 이메일, 전화번호)는 수정할 수 없습니다.');
      return;
    }
    const updatedFields = [...formFields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setFormFields(updatedFields);
  };

  const removeFormField = (index: number) => {
    // 기본 필드(이름, 이메일, 전화번호)는 삭제할 수 없음
    const field = formFields[index];
    if (field && ['name', 'email', 'phone'].includes(field.name)) {
      toast.error('기본 필드(이름, 이메일, 전화번호)는 삭제할 수 없습니다.');
      return;
    }
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  // 로딩 중이면 로딩 표시
  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로딩 중...</h1>
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
          <p className="text-gray-600 mb-6">프로그램을 생성할 권한이 없습니다.</p>
          <Button onClick={() => router.back()}>뒤로가기</Button>
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
          <h1 className="text-3xl font-bold text-gray-900">새 프로그램 등록</h1>
        </div>
        <p className="text-gray-600">새로운 프로그램을 등록하고 관리하세요.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>프로그램의 기본 정보를 입력해주세요.</CardDescription>
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
                <Label htmlFor="summary">한줄 설명 *</Label>
                <Input
                  id="summary"
                  {...register('summary')}
                  placeholder="프로그램을 한줄로 설명해주세요"
                />
                {errors.summary && (
                  <p className="text-sm text-red-600">{errors.summary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">상태 *</Label>
                <Select onValueChange={(value) => setValue('status', value as 'draft' | 'open' | 'closed' | 'archived')}>
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
            <CardDescription>프로그램의 신청 및 진행 일정을 설정해주세요.</CardDescription>
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
            <CardDescription>참여자가 작성할 신청서 양식을 구성해주세요.</CardDescription>
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
                        disabled={['name', 'email', 'phone'].includes(field.name)}
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
                        disabled={['name', 'email', 'phone'].includes(field.name)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>타입</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateFormField(index, { type: value })}
                        disabled={['name', 'email', 'phone'].includes(field.name)}
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
                        disabled={['name', 'email', 'phone'].includes(field.name)}
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
                    {!['name', 'email', 'phone'].includes(field.name) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFormField(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </Button>
                    )}
                    {['name', 'email', 'phone'].includes(field.name) && (
                      <p className="text-sm text-gray-500">기본 필드 (삭제 불가)</p>
                    )}
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
            {isLoading ? '저장 중...' : '프로그램 생성'}
          </Button>
        </div>
      </form>
    </div>
  );
}
