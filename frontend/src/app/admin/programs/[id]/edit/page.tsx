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
import { ArrowLeft, Save, Plus, Trash2, Loader2, GripVertical, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';
import { koreanDateTimeStringToUTC } from '@/lib/date-utils';

const programSchema = z.object({
  title: z.string().min(1, '프로그램명을 입력해주세요'),
  summary: z.string().min(1, '한줄 설명을 입력해주세요'),
  description: z.string().min(1, '프로그램 설명을 입력해주세요'),
  maxParticipants: z.number().min(1, '최대 참여자 수를 입력해주세요'),
  applyStart: z.string().min(1, '신청 시작일을 입력해주세요'),
  applyEnd: z.string().min(1, '신청 마감일을 입력해주세요'),
  programStart: z.string().min(1, '프로그램 시작일을 입력해주세요'),
  programEnd: z.string().min(1, '프로그램 종료일을 입력해주세요'),
  location: z.string().min(1, '장소를 입력해주세요'),
  fee: z.number().min(0, '참가비는 0 이상이어야 합니다'),
  organizerId: z.string().min(1, '주최 기관을 선택해주세요'),
  imageUrl: z.string().optional(),
  additionalImageUrl: z.string().optional(),
});

type ProgramFormData = z.infer<typeof programSchema>;

interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  page?: number; // 페이지 번호 (1부터 시작)
}

interface Program {
  id: string;
  title: string;
  summary: string;
  description: string;
  status: 'draft' | 'open' | 'closed' | 'ongoing' | 'completed' | 'archived';
  maxParticipants: number;
  applyStart: string;
  applyEnd: string;
  programStart: string;
  programEnd: string;
  location: string;
  fee: number;
  organizerId: string;
  imageUrl?: string;
  additionalImageUrl?: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [program, setProgram] = useState<Program | null>(null);
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
    {
      name: 'gender',
      type: 'text',
      label: '성별',
      description: '신청자 성별',
      required: true,
      placeholder: '성별',
    },
    {
      name: 'birthYear',
      type: 'number',
      label: '출생년도',
      description: '신청자 출생년도',
      required: true,
      placeholder: '예: 1990',
    },
    {
      name: 'hometown',
      type: 'text',
      label: '출신지역',
      description: '시/군/구까지 입력해주세요',
      required: true,
      placeholder: '예: 서울시 강남구',
    },
    {
      name: 'residence',
      type: 'text',
      label: '거주지',
      description: '시/군/구까지 입력해주세요',
      required: true,
      placeholder: '예: 서울시 강남구',
    },
  ]);

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
        summary: data.summary,  // 한줄 설명 추가
        description: data.description,
        maxParticipants: data.maxParticipants,
        applyStart: data.applyStart ? new Date(data.applyStart).toISOString().slice(0, 16) : '',
        applyEnd: data.applyEnd ? new Date(data.applyEnd).toISOString().slice(0, 16) : '',
        programStart: data.programStart ? new Date(data.programStart).toISOString().slice(0, 16) : '',
        programEnd: data.programEnd ? new Date(data.programEnd).toISOString().slice(0, 16) : '',
        location: data.location,
        fee: data.fee,
        organizerId: data.organizerId,
        imageUrl: data.imageUrl,
        additionalImageUrl: data.additionalImageUrl,
      });

      // 신청서 양식 설정
      if (data.applicationForm) {
        if (Array.isArray(data.applicationForm)) {
          // 기존 필드에 page 속성이 없으면 기본값 1로 설정
          const fieldsWithPage = data.applicationForm.map(f => ({ ...f, page: f.page || 1 }));
          setFormFields(fieldsWithPage);
        } else if (data.applicationForm && typeof data.applicationForm === 'object' && 'fields' in data.applicationForm) {
          const fields = (data.applicationForm as { fields: FormField[] }).fields;
          // 기존 필드에 page 속성이 없으면 기본값 1로 설정
          const fieldsWithPage = fields.map(f => ({ ...f, page: f.page || 1 }));
          setFormFields(fieldsWithPage);
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
        applyStart: koreanDateTimeStringToUTC(data.applyStart).toISOString(),
        applyEnd: koreanDateTimeStringToUTC(data.applyEnd).toISOString(),
        programStart: koreanDateTimeStringToUTC(data.programStart).toISOString(),
        programEnd: koreanDateTimeStringToUTC(data.programEnd).toISOString(),
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
      page: currentPage,
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

  // 총 페이지 수 계산
  const totalPages = Math.max(1, ...formFields.map(f => f.page || 1));

  // 페이지별 필드 가져오기
  const getFieldsByPage = (page: number) => {
    return formFields.filter(f => (f.page || 1) === page);
  };

  // 페이지 추가
  const addPage = () => {
    const newPageNumber = totalPages + 1;
    setCurrentPage(newPageNumber);
  };

  // 페이지 삭제
  const removePage = (pageToRemove: number) => {
    if (totalPages === 1) {
      toast.error('최소 1개의 페이지가 필요합니다.');
      return;
    }
    
    const fieldsToKeep = formFields.filter(f => (f.page || 1) !== pageToRemove);
    // 페이지 번호 재정렬
    const reorderedFields = fieldsToKeep.map(f => {
      const currentPage = f.page || 1;
      if (currentPage > pageToRemove) {
        return { ...f, page: currentPage - 1 };
      }
      return f;
    });
    
    setFormFields(reorderedFields);
    if (currentPage === pageToRemove) {
      setCurrentPage(Math.max(1, pageToRemove - 1));
    } else if (currentPage > pageToRemove) {
      setCurrentPage(currentPage - 1);
    }
  };

  // 필드의 페이지 변경
  const moveFieldToPage = (fieldIndex: number, targetPage: number) => {
    const updatedFields = [...formFields];
    updatedFields[fieldIndex] = { ...updatedFields[fieldIndex], page: targetPage };
    setFormFields(updatedFields);
  };

  const duplicateFormField = (index: number) => {
    const fieldToDuplicate = formFields[index];
    const newField: FormField = {
      ...fieldToDuplicate,
      name: `field_${Date.now()}`,
      label: `${fieldToDuplicate.label} (복사본)`,
    };
    setFormFields([...formFields.slice(0, index + 1), newField, ...formFields.slice(index + 1)]);
  };

  const moveFormField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formFields.length - 1) return;
    
    const newFields = [...formFields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFormFields(newFields);
  };

  const addOption = (fieldIndex: number) => {
    const updatedFields = [...formFields];
    if (!updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options = [];
    }
    updatedFields[fieldIndex].options!.push('새 옵션');
    setFormFields(updatedFields);
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updatedFields = [...formFields];
    if (updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options![optionIndex] = value;
      setFormFields(updatedFields);
    }
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updatedFields = [...formFields];
    if (updatedFields[fieldIndex].options) {
      updatedFields[fieldIndex].options!.splice(optionIndex, 1);
      setFormFields(updatedFields);
    }
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
  if (!user || (user.role !== 'admin' && user.role !== 'operator' && user.role !== 'staff')) {
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
      <div className="max-w-7xl mx-auto">
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
                <Label>대표 이미지</Label>
                <ImageUpload
                  value={watch('imageUrl')}
                  onChange={(url) => setValue('imageUrl', url)}
                />
                <p className="text-xs text-gray-500">
                  프로그램 목록에 표시될 대표 이미지를 업로드하세요 (선택사항)
                </p>
              </div>

              <div className="space-y-2">
                <Label>추가 이미지</Label>
                <ImageUpload
                  value={watch('additionalImageUrl')}
                  onChange={(url) => setValue('additionalImageUrl', url)}
                />
                <p className="text-xs text-gray-500">
                  프로그램 상세 페이지에 표시될 추가 이미지를 업로드하세요 (선택사항)
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">프로그램 설명 *</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="프로그램에 대한 자세한 설명을 입력해주세요"
                rows={6}
                className="max-w-4xl mx-auto"
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
            <CardDescription>참여자가 작성할 신청서 양식을 수정해주세요. 페이지를 나누어 질문을 구성할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 페이지 탭 */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}페이지
                  </button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPage}
                  className="ml-2"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  페이지 추가
                </Button>
                {totalPages > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePage(currentPage)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    현재 페이지 삭제
                  </Button>
                )}
              </div>
              <Button type="button" onClick={addFormField} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                필드 추가
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">페이지 {currentPage} - 신청서 필드</h3>
              {formFields
                .map((field, index) => ({ field, index }))
                .filter(({ field }) => (field.page || 1) === currentPage)
                .map(({ field, index }) => (
                <div key={index} className="p-6 border-2 border-gray-200 rounded-lg bg-white hover:border-blue-300 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* 드래그 핸들 */}
                    <div className="flex flex-col gap-1 pt-2">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 cursor-move"
                        onClick={() => moveFormField(index, 'up')}
                        disabled={index === 0}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <GripVertical className="h-5 w-5 text-gray-400" />
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 cursor-move"
                        onClick={() => moveFormField(index, 'down')}
                        disabled={index === formFields.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>

                    {/* 필드 설정 */}
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>질문 *</Label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateFormField(index, { label: e.target.value })}
                            placeholder="질문을 입력해주세요"
                            className="text-base"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>필드 타입 *</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) => updateFormField(index, { type: value as FormField['type'] })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">단답형</SelectItem>
                              <SelectItem value="textarea">장문형</SelectItem>
                              <SelectItem value="email">이메일</SelectItem>
                              <SelectItem value="tel">전화번호</SelectItem>
                              <SelectItem value="number">숫자</SelectItem>
                              <SelectItem value="select">드롭다운</SelectItem>
                              <SelectItem value="radio">객관식 (하나 선택)</SelectItem>
                              <SelectItem value="checkbox">체크박스 (여러 개 선택)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* 페이지 선택 */}
                      {totalPages > 1 && (
                        <div className="space-y-2">
                          <Label>페이지</Label>
                          <Select
                            value={String(field.page || 1)}
                            onValueChange={(value) => moveFieldToPage(index, parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <SelectItem key={pageNum} value={String(pageNum)}>
                                  {pageNum}페이지
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>설명 (선택사항)</Label>
                        <Input
                          value={field.description || ''}
                          onChange={(e) => updateFormField(index, { description: e.target.value })}
                          placeholder="질문에 대한 추가 설명이나 안내사항을 입력해주세요"
                        />
                      </div>

                      {/* 옵션이 필요한 필드 타입 */}
                      {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>선택 항목</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(index)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              옵션 추가
                            </Button>
                          </div>
                          <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                            {field.options && field.options.length > 0 ? (
                              field.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                    placeholder={`옵션 ${optionIndex + 1}`}
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOption(index, optionIndex)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500">옵션을 추가해주세요</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* placeholder */}
                      {(field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'number') && (
                        <div className="space-y-2">
                          <Label>플레이스홀더 (선택사항)</Label>
                          <Input
                            value={field.placeholder || ''}
                            onChange={(e) => updateFormField(index, { placeholder: e.target.value })}
                            placeholder="예: 이름을 입력해주세요"
                          />
                        </div>
                      )}

                      {/* 필수 여부 */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`required-${index}`}
                          checked={field.required}
                          onChange={(e) => updateFormField(index, { required: e.target.checked })}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor={`required-${index}`} className="cursor-pointer">
                          필수 질문
                        </Label>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateFormField(index)}
                        title="복사"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeFormField(index)}
                        className="text-red-600 hover:text-red-700"
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {getFieldsByPage(currentPage).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>이 페이지에 추가된 신청서 필드가 없습니다.</p>
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
    </div>
  );
}
