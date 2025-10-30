'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { PasswordValidator } from './password-validator';
import { Gender } from '@/types/auth';

const registerSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(/[A-Z]/, '비밀번호는 대문자를 포함해야 합니다')
    .regex(/[~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, '비밀번호는 특수문자를 포함해야 합니다'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  phone: z.string().min(1, '전화번호는 필수입니다').regex(/^[0-9]+$/, '전화번호는 숫자만 입력해주세요 (하이픈 제외)'),
  gender: z.enum(['male', 'female']).optional(),
  birthYear: z.string().optional(),
  hometown: z.string().optional(),
  residence: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // birthYear를 문자열에서 숫자로 변환
      const submitData = {
        ...data,
        birthYear: data.birthYear && data.birthYear !== '' ? parseInt(data.birthYear, 10) : undefined,
      };
      // 유효성 검사
      if (submitData.birthYear !== undefined) {
        const currentYear = new Date().getFullYear();
        if (submitData.birthYear < 1950 || submitData.birthYear > currentYear || isNaN(submitData.birthYear)) {
          toast.error('올바른 출생년도를 입력해주세요 (1950 ~ ' + currentYear + ')');
          setIsLoading(false);
          return;
        }
      }
      await registerUser(submitData);
      toast.success('회원가입에 성공했습니다');
      
      // 회원가입 후 로그인 페이지로 리다이렉트
      router.push('/auth/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '회원가입에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">새로운 시작!</h2>
        <p className="text-sm text-gray-600">
          Nuvio에 가입하여 청년마을 프로그램을 신청해보세요
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            이름
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="홍길동"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              {errors.name.message}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            이메일 주소
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="example@email.com"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              {errors.email.message}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            전화번호
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="01012345678"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
            성별
          </Label>
          <Select onValueChange={(value) => setValue('gender', value as Gender)}>
            <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
              <SelectValue placeholder="성별을 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">남</SelectItem>
              <SelectItem value="female">여</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              {errors.gender.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthYear" className="text-sm font-medium text-gray-700">
            출생년도
          </Label>
          <Input
            id="birthYear"
            type="number"
            placeholder="예: 1990"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            {...register('birthYear')}
          />
          {errors.birthYear && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              {errors.birthYear.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="hometown" className="text-sm font-medium text-gray-700">
            출신지역
          </Label>
          <Input
            id="hometown"
            type="text"
            placeholder="예: 서울시"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            {...register('hometown')}
          />
          <p className="text-xs text-gray-500">시까지만 입력해주세요 (예: 서울시, 부산시)</p>
          {errors.hometown && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              {errors.hometown.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="residence" className="text-sm font-medium text-gray-700">
            거주지
          </Label>
          <Input
            id="residence"
            type="text"
            placeholder="예: 서울시"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            {...register('residence')}
          />
          <p className="text-xs text-gray-500">시까지만 입력해주세요 (예: 서울시, 부산시)</p>
          {errors.residence && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              {errors.residence.message}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            비밀번호
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="8자 이상, 대문자, 특수문자 포함"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            {...register('password')}
          />
          {watchedPassword && <PasswordValidator password={watchedPassword} />}
          {errors.password && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <span>⚠️</span>
              {errors.password.message}
            </p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              가입 중...
            </div>
          ) : (
            '회원가입하기'
          )}
        </Button>
      </form>
    </div>
  );
}