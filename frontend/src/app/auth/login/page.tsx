'use client';

import { useAuth } from '@/hooks/use-auth';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nuvio
          </h1>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nuvio에 오신 것을 환영합니다!
          </h1>
          <p className="text-gray-600">
            이미 로그인되어 있습니다. 청년마을 프로그램을 확인해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* 브랜딩 섹션 */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <span className="text-2xl font-bold text-white">N</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nuvio
          </h1>
          <p className="text-lg text-gray-700 font-medium">
            청년마을 프로그램 신청을 더 편하게!
          </p>
          <p className="text-sm text-gray-600">
            간편하고 안전한 프로그램 신청 시스템
          </p>
        </div>
        
        {/* 로그인/회원가입 탭 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
              <TabsTrigger value="login" className="rounded-md">로그인</TabsTrigger>
              <TabsTrigger value="register" className="rounded-md">회원가입</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <LoginForm />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* 하단 정보 */}
        <div className="text-center text-xs text-gray-500">
          <p>청년마을 프로그램과 함께 성장하세요 🌱</p>
        </div>
      </div>
    </div>
  );
}
