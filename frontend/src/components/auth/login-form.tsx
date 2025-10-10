'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요'),
  password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('로그인에 성공했습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '로그인에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">환영합니다!</h2>
        <p className="text-sm text-gray-600">
          계정에 로그인하여 프로그램을 신청해보세요
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
            비밀번호
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
            {...register('password')}
          />
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
              로그인 중...
            </div>
          ) : (
            '로그인하기'
          )}
        </Button>
      </form>
    </div>
  );
}
