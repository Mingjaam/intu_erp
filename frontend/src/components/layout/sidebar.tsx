'use client';

import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@/types/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  ClipboardList, 
  MapPin,
  BarChart3,
  Settings
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: '대시보드', href: '/dashboard', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.OPERATOR] },
  { name: '사용자 관리', href: '/users', icon: Users, roles: [UserRole.ADMIN, UserRole.OPERATOR] },
  { name: '조직 관리', href: '/organizations', icon: Building2, roles: [UserRole.ADMIN, UserRole.OPERATOR] },
  { name: '프로그램 관리', href: '/programs', icon: FileText, roles: [UserRole.ADMIN, UserRole.OPERATOR] },
  { name: '신청 관리', href: '/applications', icon: ClipboardList, roles: [UserRole.ADMIN, UserRole.OPERATOR, UserRole.REVIEWER] },
  { name: '방문 관리', href: '/visits', icon: MapPin, roles: [UserRole.ADMIN, UserRole.OPERATOR] },
  { name: '보고서', href: '/reports', icon: BarChart3, roles: [UserRole.ADMIN, UserRole.OPERATOR] },
  { name: '설정', href: '/settings', icon: Settings, roles: [UserRole.ADMIN] },
];

const userNavigation = [
  { name: '프로그램 목록', href: '/programs', icon: FileText },
  { name: '내 신청서', href: '/my-applications', icon: ClipboardList },
  { name: '프로필', href: '/profile', icon: Settings },
];

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const isAdminOrOperator = user.role === UserRole.ADMIN || user.role === UserRole.OPERATOR;
  const menuItems = isAdminOrOperator ? navigation : userNavigation;

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white">
      <div className="flex items-center h-16 px-4">
        <h2 className="text-lg font-semibold">Intu ERP</h2>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
