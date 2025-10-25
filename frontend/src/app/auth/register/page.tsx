'use client';

import { useAuth } from '@/hooks/use-auth';
import { RegisterForm } from '@/components/auth/register-form';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // 이미 로그인된 사용자는 역할별 페이지로 리다이렉트
  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'admin' || user.role === 'operator' || user.role === 'staff') {
        router.push('/admin');
      } else {
        router.push('/programs');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Nuvio에 오신 것을 환영합니다
          </h1>
          <p className="text-gray-600">
            이미 로그인되어 있습니다. 대시보드로 이동하세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Nuvio</h1>
          <p className="mt-2 text-sm text-gray-600">
            신청자, 수혜자, 프로그램, 후속 활동을 관리하는 ERP 시스템
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">회원가입</h2>
            <p className="mt-2 text-sm text-gray-600">
              새로운 계정을 만들어 프로그램에 신청하세요
            </p>
          </div>
          
          <RegisterForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <a 
                href="/auth/login" 
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                로그인하기
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
