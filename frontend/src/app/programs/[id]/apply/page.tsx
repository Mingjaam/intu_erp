'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// import { Checkbox } from '@/components/ui/checkbox';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogIn, UserPlus, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Program } from '@/types/program';
import { Application } from '@/types/application';
import { Header } from '@/components/layout/header';

interface FormField {
  name: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  page?: number; // 페이지 번호 (1부터 시작)
}

function ApplyPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loginDialog, setLoginDialog] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false,
  });

  const programId = params.id as string;
  const editApplicationId = searchParams.get('edit');

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await apiClient.get<Program>(API_ENDPOINTS.PROGRAMS.DETAIL(programId));
        const data = response.data || response;
        setProgram(data);
      } catch (error) {
        console.error('프로그램 조회 오류:', error);
        toast.error('프로그램 정보를 불러오는데 실패했습니다.');
        router.push('/programs');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchExistingApplication = async () => {
      if (editApplicationId) {
        try {
          const response = await apiClient.get<Application>(API_ENDPOINTS.APPLICATIONS.DETAIL(editApplicationId));
          const data = response.data || response;
          setExistingApplication(data);
          setFormData(data.payload);
          setIsEditing(true);
        } catch (error) {
          console.error('기존 신청서 조회 오류:', error);
          toast.error('기존 신청서를 불러오는데 실패했습니다.');
        }
      }
    };

    if (programId) {
      fetchProgram();
      if (editApplicationId) {
        fetchExistingApplication();
      }
    }
  }, [programId, router, editApplicationId]);

  // 사용자 정보로 폼 데이터 초기화
  useEffect(() => {
    if (user && program && !editApplicationId && !isEditing) {
      const getGenderLabel = (gender?: string) => {
        switch (gender) {
          case 'male': return '남';
          case 'female': return '여';
          default: return '';
        }
      };

      // 프로그램의 applicationForm fields 가져오기
      const applicationForm = program.applicationForm as { fields?: FormField[] } | undefined;
      const fields = applicationForm?.fields || [];
      
      // 사용자 정보에서 모든 필드 가져오기
      const initialData: Record<string, unknown> = {};
      
      // 프로그램의 각 필드에 대해 사용자 정보 매핑
      fields.forEach(field => {
        const fieldName = field.name;
        switch (fieldName) {
          case 'name':
            if (user.name) initialData[fieldName] = user.name;
            break;
          case 'email':
            if (user.email) initialData[fieldName] = user.email;
            break;
          case 'phone':
            if (user.phone) initialData[fieldName] = user.phone;
            break;
          case 'gender':
            const genderLabel = getGenderLabel(user.gender);
            if (genderLabel) initialData[fieldName] = genderLabel;
            break;
          case 'birthYear':
            if (user.birthYear !== undefined && user.birthYear !== null) {
              initialData[fieldName] = user.birthYear;
            }
            break;
          case 'hometown':
            if (user.hometown) initialData[fieldName] = user.hometown;
            break;
          case 'residence':
            if (user.residence) initialData[fieldName] = user.residence;
            break;
          default:
            // 다른 필드는 초기화하지 않음
            break;
        }
      });
      
      // 사용자 정보로 필드 채우기
      setFormData(prev => {
        const updated = { ...prev };
        // initialData에 있는 모든 필드를 적용 (기존 값이 없거나 빈 값일 때만)
        Object.keys(initialData).forEach(key => {
          if (!prev[key] || prev[key] === '') {
            updated[key] = initialData[key];
          }
        });
        return updated;
      });
    }
  }, [user, program, editApplicationId, isEditing]);

  const handleInputChange = (fieldName: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setLoginDialog({ isOpen: true });
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (isEditing && existingApplication) {
        // 기존 신청서 수정
        const applicationData = {
          payload: formData,
          status: 'submitted', // 수정 시 다시 제출 상태로 변경
        };

        await apiClient.patch(API_ENDPOINTS.APPLICATIONS.UPDATE(existingApplication.id), applicationData);
        toast.success('신청서가 수정되었습니다.');
        router.push(`/applications/${existingApplication.id}`);
      } else {
        // 새 신청서 제출
        const applicationData = {
          programId,
          payload: formData,
        };

        await apiClient.post(API_ENDPOINTS.APPLICATIONS.CREATE, applicationData);
        toast.success('신청이 완료되었습니다.');
        router.push(`/programs/${programId}`);
      }
    } catch (error) {
      console.error('신청 제출 오류:', error);
      toast.error(isEditing ? '신청서 수정에 실패했습니다.' : '신청 제출에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그인 다이얼로그 닫기
  const closeLoginDialog = () => {
    setLoginDialog({ isOpen: false });
  };

  const renderFormField = (field: FormField) => {
    const { name, type, label, description, required, options, placeholder } = field;
    const value = formData[name] || '';

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && type !== 'textarea') {
        e.preventDefault();
      }
    };

    switch (type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
            <Input
              id={name}
              type={type}
              value={value as string}
              onChange={(e) => handleInputChange(name, e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              required={required}
            />
          </div>
        );

      case 'number':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
            <Input
              id={name}
              type="number"
              value={value as string}
              onChange={(e) => handleInputChange(name, parseInt(e.target.value) || '')}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              required={required}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
            <Textarea
              id={name}
              value={value as string}
              onChange={(e) => handleInputChange(name, e.target.value)}
              placeholder={placeholder}
              required={required}
              rows={4}
            />
          </div>
        );

      case 'select':
        return (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
            <select
              id={name}
              value={value as string}
              onChange={(e) => handleInputChange(name, e.target.value)}
              required={required}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택하세요</option>
              {options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );

      case 'radio':
        return (
          <div key={name} className="space-y-2">
            <Label>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
            <div className="space-y-2">
              {options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${name}-${option}`}
                    name={name}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(name, e.target.value)}
                    required={required}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label htmlFor={`${name}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={name} className="space-y-2">
            <Label>
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
            <div className="space-y-2">
              {options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${name}-${option}`}
                    checked={Array.isArray(value) ? value.includes(option) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleInputChange(name, [...currentValues, option]);
                      } else {
                        handleInputChange(name, currentValues.filter((v: string) => v !== option));
                      }
                    }}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label htmlFor={`${name}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">프로그램을 찾을 수 없습니다</h1>
          <Button asChild>
            <Link href="/programs">프로그램 목록으로 돌아가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  const applicationForm = program.applicationForm as { fields: FormField[] };
  const fields = applicationForm?.fields || [];

  // 페이지별 필드 분류
  const totalPages = Math.max(1, ...fields.map(f => f.page || 1));
  const fieldsByPage = Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => ({
    pageNum,
    fields: fields.filter(f => (f.page || 1) === pageNum)
  }));

  const currentPageFields = fieldsByPage.find(p => p.pageNum === currentPage)?.fields || [];

  // 다음 페이지로 이동
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 이전 페이지로 이동
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 현재 페이지의 필수 필드 검증
  const validateCurrentPage = () => {
    const requiredFields = currentPageFields.filter(f => f.required);
    for (const field of requiredFields) {
      const value = formData[field.name];
      if (!value || (typeof value === 'string' && value.trim() === '') || 
          (Array.isArray(value) && value.length === 0)) {
        toast.error(`${field.label}은(는) 필수 항목입니다.`);
        return false;
      }
    }
    return true;
  };

  // 다음 페이지로 이동 (검증 포함)
  const handleNextPage = () => {
    if (validateCurrentPage()) {
      goToNextPage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex justify-center pb-16 md:pb-0">
        <div className="w-full max-w-4xl px-4 py-8">
          <div className="mb-6">
            <Button variant="outline" asChild className="mb-4">
              <Link href={`/programs/${program.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                프로그램 상세로 돌아가기
              </Link>
            </Button>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {program.title} {isEditing ? '신청서 수정' : '신청'}
            </h1>
          </div>

          <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>{isEditing ? '신청서 수정' : '신청서 작성'}</CardTitle>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => {
                            if (pageNum < currentPage || validateCurrentPage()) {
                              setCurrentPage(pageNum);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                          }}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <form 
                    onSubmit={handleSubmit} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target instanceof HTMLInputElement && e.target.type !== 'textarea') {
                        e.preventDefault();
                      }
                    }}
                    className="space-y-6"
                  >
                    {totalPages > 1 && (
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-600">페이지 {currentPage} / {totalPages}</p>
                      </div>
                    )}
                    
                    {currentPageFields.map((field) => renderFormField(field))}
                    
                    <div className="pt-6 border-t flex gap-4">
                      {currentPage > 1 && (
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={goToPreviousPage}
                          className="flex-1"
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          이전 페이지
                        </Button>
                      )}
                      
                      {currentPage < totalPages ? (
                        <Button 
                          type="button"
                          onClick={handleNextPage}
                          className={currentPage === 1 ? 'w-full' : 'flex-1'}
                        >
                          다음 페이지
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          type="submit" 
                          className={currentPage === 1 ? 'w-full' : 'flex-1'}
                          disabled={isSubmitting}
                        >
                          {isSubmitting 
                            ? (isEditing ? '수정 중...' : '제출 중...') 
                            : (isEditing ? '신청서 수정' : '신청 제출')
                          }
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
          </div>
        </div>
      </div>

      {/* 로그인 다이얼로그 */}
      <Dialog open={loginDialog.isOpen} onOpenChange={closeLoginDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold">
              로그인이 필요한 서비스입니다
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 프로그램 정보 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserPlus className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {program?.title}
              </h3>
              <p className="text-sm text-gray-600">
                프로그램에 신청하려면 로그인이 필요합니다.
              </p>
            </div>

            {/* 안내 메시지 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700 text-center">
                로그인 후 프로그램 신청이 가능합니다.
              </p>
            </div>

            {/* 버튼 그룹 */}
            <div className="space-y-3">
              <Button
                asChild
                className="w-full"
              >
                <Link href="/auth/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  로그인하기
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="w-full"
              >
                <Link href="/auth/login?tab=register">
                  <UserPlus className="h-4 w-4 mr-2" />
                  회원가입하기
                </Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <ApplyPageContent />
    </Suspense>
  );
}