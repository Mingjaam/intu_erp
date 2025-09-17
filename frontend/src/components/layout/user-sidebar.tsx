'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { 
  Home, 
  FolderOpen,
  FileText,
  Calendar
} from 'lucide-react';

const userNavigation = [
  { 
    name: '홈', 
    href: '/', 
    icon: Home,
    description: '메인 대시보드',
    color: 'bg-blue-500',
    children: []
  },
  { 
    name: '프로그램', 
    href: '/programs', 
    icon: FolderOpen,
    description: '다양한 프로그램 둘러보기',
    color: 'bg-blue-600',
    children: [
      { name: '전체 프로그램', href: '/programs' },
    ]
  },
  { 
    name: '내 신청서', 
    href: '/applications', 
    icon: FileText,
    description: '신청한 프로그램 관리',
    color: 'bg-blue-700',
    children: [
      { name: '내가 신청한 프로그램', href: '/applications' },
    ]
  },
  { 
    name: '캘린더', 
    href: '/calendar', 
    icon: Calendar,
    description: '일정 확인하기',
    color: 'bg-blue-800',
    children: [
      { name: '전체 일정', href: '/calendar' },
    ]
  },
];

export function UserSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['홈']);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <div className="hidden md:flex md:w-72 md:flex-col">
      <div className="flex flex-col flex-grow bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 shadow-lg">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">마을 프로그램</h1>
              <p className="text-sm text-gray-600">함께 성장하는 마을</p>
            </div>
          </div>
          
          <nav className="space-y-3">
            {userNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const isExpanded = expandedItems.includes(item.name);
              
              return (
                <div key={item.name} className="space-y-2">
                  <div
                    className={cn(
                      isActive
                        ? 'bg-white shadow-lg border-l-4 border-blue-500'
                        : 'bg-white/70 hover:bg-white hover:shadow-md',
                      'group flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200'
                    )}
                    onClick={() => {
                      if (item.children.length > 0) {
                        toggleExpanded(item.name);
                      } else {
                        window.location.href = item.href;
                      }
                    }}
                  >
                    <div className={cn(
                      item.color,
                      'w-10 h-10 rounded-lg flex items-center justify-center mr-4 shadow-sm'
                    )}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className={cn(
                        isActive ? 'text-gray-900 font-semibold' : 'text-gray-700 font-medium',
                        'text-sm'
                      )}>
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    </div>
                    {item.children.length > 0 && (
                      <div className={cn(
                        isExpanded ? 'rotate-90' : '',
                        'transition-transform duration-200'
                      )}>
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
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
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50',
                              'block px-4 py-2 text-sm rounded-lg transition-colors duration-200'
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
