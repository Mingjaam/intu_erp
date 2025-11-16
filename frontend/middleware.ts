import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // /admin 경로 접근 시 인증 확인
  if (path.startsWith('/admin')) {
    // 쿠키에서 accessToken 확인
    const token = request.cookies.get('accessToken');
    
    // Authorization 헤더에서도 확인 (클라이언트에서 헤더로 보낼 경우)
    const authHeader = request.headers.get('authorization');
    const hasToken = token || (authHeader && authHeader.startsWith('Bearer '));
    
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    // 참고: 실제로는 클라이언트 사이드에서 localStorage를 사용하므로
    // admin/layout.tsx에서도 추가 체크를 수행합니다
    if (!hasToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
};

