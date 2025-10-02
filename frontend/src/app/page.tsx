'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // 로그인된 사용자는 역할별 페이지로 리다이렉트
        if (user.role === 'admin' || user.role === 'operator' || user.role === 'staff') {
          router.push('/admin');
        } else {
          router.push('/programs');
        }
      } else {
        // 로그인되지 않은 사용자는 programs 페이지로 리다이렉트
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

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Intu ERP에 오신 것을 환영합니다
        </h1>
        <p className="text-gray-600">
          페이지를 이동하고 있습니다...
        </p>
      </div>
    </div>
  );
}