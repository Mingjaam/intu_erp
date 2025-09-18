'use client';

import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Program } from '@/types/program';
import { Application } from '@/types/application';
import { Header } from '@/components/layout/header';
import { UserSidebar } from '@/components/layout/user-sidebar';

interface FormField {
  name: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox';
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export default function ApplyPage() {
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

  const programId = params.id as string;
  const editApplicationId = searchParams.get('edit');

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await apiClient.get<Program>(API_ENDPOINTS.PROGRAMS.DETAIL(programId));
        const data = response.data || response;
        setProgram(data);
        
        // 로그인된 사용자 정보로 기본값 설정 (기본 필드들)
        if (user) {
          const initialData: Record<string, unknown> = {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
          };
          setFormData(initialData);
        }
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
    }, [programId, user, router, editApplicationId]);

  const handleInputChange = (fieldName: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('로그인이 필요합니다.');
      router.push('/auth/login');
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
              disabled={!!(user && ['name', 'email', 'phone'].includes(name))}
              className={user && ['name', 'email', 'phone'].includes(name) ? 'bg-gray-50' : ''}
            />
            {user && ['name', 'email', 'phone'].includes(name) && (
              <p className="text-xs text-gray-500">로그인된 사용자 정보 (수정 불가)</p>
            )}
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <UserSidebar />
        <div className="flex-1 pb-16 md:pb-0">
          <div className="container mx-auto px-4 py-8">
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
              <p className="text-gray-600">{program.description}</p>
            </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{isEditing ? '신청서 수정' : '신청서 작성'}</CardTitle>
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
                {fields.map((field) => renderFormField(field))}
                
                <div className="pt-6 border-t">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? (isEditing ? '수정 중...' : '제출 중...') 
                      : (isEditing ? '신청서 수정' : '신청 제출')
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>프로그램 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{program.organizer.name}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {new Date(program.applyStart).toLocaleDateString()} -{' '}
                  {new Date(program.applyEnd).toLocaleDateString()}
                </span>
              </div>
              
              {program.metadata && (
                <div className="space-y-2">
                  {Object.entries(program.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        <strong>{key}:</strong> {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>신청 안내</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>• 신청 후 수정이 불가능하니 신중히 작성해주세요.</p>
              <p>• 필수 항목은 반드시 입력해주세요.</p>
              <p>• 신청 결과는 이메일로 안내드립니다.</p>
            </CardContent>
            </Card>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}