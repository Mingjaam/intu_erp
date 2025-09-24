'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { 
  FolderOpen,
  FileText,
  Calendar,
  LogIn,
  UserPlus
} from 'lucide-react';

const userNavigation = [
  { 
    name: '프로그램', 
    href: '/programs', 
    icon: FolderOpen,
    color: 'bg-blue-500'
  },
  { 
    name: '내 신청서', 
    href: '/applications', 
    icon: FileText,
    color: 'bg-blue-600'
  },
  { 
    name: '캘린더', 
    href: '/calendar', 
    icon: Calendar,
    color: 'bg-blue-700'
  },
];

const guestNavigation = [
  { 
    name: '프로그램', 
    href: '/programs', 
    icon: FolderOpen,
    color: 'bg-blue-500'
  },
  { 
    name: '로그인', 
    href: '/auth/login', 
    icon: LogIn,
    color: 'bg-green-500'
  },
  { 
    name: '회원가입', 
    href: '/auth/register', 
    icon: UserPlus,
    color: 'bg-purple-500'
  },
];

export function UserSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const navigation = user ? userNavigation : guestNavigation;

  return (
    <>
      {/* 데스크톱 사이드바 - 전체 배경 위에 떠있는 형태 */}
      <div className="hidden md:flex md:w-72 md:flex-col">
        <div className="flex flex-col flex-grow overflow-y-auto">
          <div className="flex-1 flex items-start justify-center p-6 pt-32" style={{ minHeight: '100vh' }}>
            <nav className="space-y-6 w-full">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-white/95 shadow-xl border-l-4 border-blue-500 backdrop-blur-md'
                        : 'bg-white/70 hover:bg-white/85 hover:shadow-lg hover:scale-105 backdrop-blur-sm',
                      'group flex items-center p-4 rounded-xl transition-all duration-300 transform h-16 min-h-16'
                    )}
                  >
                    <div className={cn(
                      item.color,
                      'w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0'
                    )}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 flex items-center min-h-0">
                      <h3 className={cn(
                        isActive ? 'text-gray-900 font-semibold' : 'text-gray-700 font-medium group-hover:text-gray-900',
                        'text-sm transition-colors duration-300 leading-none'
                      )}>
                        {item.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* 모바일 하단 네비게이션 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="flex justify-around py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive ? 'text-blue-600' : 'text-gray-500',
                  'flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-colors duration-200'
                )}
              >
                <div className={cn(
                  item.color,
                  'w-8 h-8 rounded-lg flex items-center justify-center mb-1 shadow-sm'
                )}>
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-medium truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
