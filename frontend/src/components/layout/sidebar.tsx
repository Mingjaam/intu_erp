'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { 
  Home, 
  Users, 
  Settings, 
  FolderOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  BarChart3
} from 'lucide-react';

const getNavigation = (userRole: string) => {
  const baseNavigation = [
    { 
      name: '대시보드', 
      href: '/admin', 
      icon: Home,
      children: []
    },
    { 
      name: '캘린더', 
      href: '/admin/calendar', 
      icon: Calendar,
      children: []
    },
    { 
      name: '프로그램', 
      href: '/admin/programs', 
      icon: FolderOpen,
      children: [
        { name: '전체 프로그램', href: '/admin/programs' },
        { name: '프로그램 등록', href: '/admin/programs/new' },
      ]
    },
    { 
      name: '회원', 
      href: '/admin/users', 
      icon: Users,
      children: (() => {
        const children = [
          { name: '전체 회원', href: '/admin/users' },
        ];
        // 관리자와 운영자만 신고 회원 메뉴 표시
        if (userRole === 'admin' || userRole === 'operator') {
          children.push({ name: '신고 회원', href: '/admin/users/reports' });
        }
        return children;
      })()
    },
    { 
      name: '보고서', 
      href: '/admin/reports', 
      icon: BarChart3,
      children: [
        { name: '참여자 현황', href: '/admin/reports/participants' },
        { name: '사업참여인력 현황', href: '/admin/reports/staff' },
        { name: '사업 진행비 현황', href: '/admin/reports/budget' },
      ]
    }
  ];

  // 모든 역할이 마을 및 직원 관리 접근 가능
  baseNavigation.push({
    name: '마을 관리', 
    href: '/admin/village/manage', 
    icon: Settings,
    children: [
      { name: '마을 및 직원 관리', href: '/admin/village/manage' },
    ]
  });

  // 관리자, 운영자, 직원이 관리자 전용 메뉴 표시
  if (userRole === 'admin' || userRole === 'operator' || userRole === 'staff') {
    baseNavigation.push({
      name: '관리자 전용', 
      href: '/admin/users/manage', 
      icon: Settings,
      children: [
        { name: '회원 관리', href: '/admin/users/manage' },
        { name: '전체 마을', href: '/admin/villages' },
      ]
    });
  }

  return baseNavigation;
};

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['대시보드', '프로그램', '회원', '보고서', '마을 관리', '관리자 전용']);
  
  const navigation = getNavigation(user?.role || '');

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">마을 관리</h1>
          </div>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const isExpanded = expandedItems.includes(item.name);
              
              return (
                <div key={item.name}>
                  <div
                    className={cn(
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer'
                    )}
                    onClick={() => {
                      if (item.children.length > 0) {
                        toggleExpanded(item.name);
                      } else {
                        window.location.href = item.href;
                      }
                    }}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 flex-shrink-0 h-5 w-5'
                      )}
                    />
                    <span className="flex-1">{item.name}</span>
                    {item.children.length > 0 && (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )
                    )}
                  </div>
                  
                  {isExpanded && item.children.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={cn(
                              isChildActive
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
                              'block px-2 py-1 text-sm rounded-md'
                            )}
                          >
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}