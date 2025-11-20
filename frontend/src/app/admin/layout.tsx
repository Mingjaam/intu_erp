'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // body의 overflow를 숨겨서 스크롤바 중복 방지
    document.body.style.overflow = 'hidden';
    
    return () => {
      // 컴포넌트 언마운트 시 원래대로 복원
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    // 로딩이 완료되고 사용자가 없거나 권한이 없으면 로그인 페이지로 리다이렉트
    if (!loading) {
      if (!user) {
        router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }
      
      // 관리자, 운영자, 직원만 접근 가능
      if (user.role !== 'admin' && user.role !== 'operator' && user.role !== 'staff') {
        router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
        return;
      }
    }
  }, [user, loading, router]);

  // 로딩 중이거나 권한이 없으면 아무것도 렌더링하지 않음
  if (loading || !user || (user.role !== 'admin' && user.role !== 'operator' && user.role !== 'staff')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // /admin 페이지에서는 Sidebar 숨김
  const isAdminPage = pathname === '/admin';

  return (
    <div className="flex h-screen bg-gray-50">
      {!isAdminPage && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isAdminPage && <Header />}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
