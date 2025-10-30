'use client';

// import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Search, Bell, FileText, Shield } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/programs');
  };

  if (!user) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Nuvio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/programs">
                <Button variant="ghost">프로그램 보기</Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline">로그인</Button>
              </Link>
              <Link href="/auth/login?tab=register">
                <Button>회원가입</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/programs" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <h1 className="text-xl font-bold cursor-pointer">
                {user?.organization?.name || '마을 프로그램'}
              </h1>
            </Link>
          </div>

          {/* 검색창 */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="프로그램 검색..."
                className="w-full pl-10 pr-4 py-2 border-0 rounded-full focus:ring-2 focus:ring-white/30 focus:outline-none bg-white/90 backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* 캘린더 버튼 */}
            <Link href="/calendar">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 text-xl">
                📅
              </Button>
            </Link>
            
            {/* 알림 */}
            <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/20">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>

            {/* 사용자 프로필 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-3 text-white hover:bg-white/20 rounded-full px-3 py-2">
                  <Avatar className="h-8 w-8 ring-2 ring-white/30">
                    <AvatarFallback className="bg-white text-blue-700 font-semibold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{user.name}님</p>
                    <p className="text-xs text-white/80">
                      {user.role === 'admin' ? '관리자' : user.role === 'operator' ? '운영자' : user.role === 'staff' ? '직원' : '신청자'}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {user.role === 'admin' ? '관리자' : user.role === 'operator' ? '운영자' : user.role === 'staff' ? '직원' : '신청자'}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    프로필
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/applications" className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    내 신청서
                  </Link>
                </DropdownMenuItem>
                
                {/* 관리자 이상일 경우에만 관리자 페이지 메뉴 표시 */}
                {(user.role === 'admin' || user.role === 'operator' || user.role === 'staff') && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      관리자 페이지
                    </Link>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}