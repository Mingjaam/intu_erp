'use client';

import { useAuth } from '@/hooks/use-auth';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, ClipboardList, MapPin } from 'lucide-react';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            로그인이 필요합니다
          </h1>
          <p className="text-gray-600">
            대시보드에 접근하려면 먼저 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: '총 사용자',
      value: '1,234',
      description: '전체 등록된 사용자 수',
      icon: Users,
    },
    {
      title: '진행 중인 프로그램',
      value: '12',
      description: '현재 모집 중인 프로그램',
      icon: FileText,
    },
    {
      title: '신청서',
      value: '456',
      description: '이번 달 신청서 수',
      icon: ClipboardList,
    },
    {
      title: '방문 예정',
      value: '23',
      description: '이번 주 방문 예정',
      icon: MapPin,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
              <p className="text-gray-600">
                안녕하세요, {user?.name}님! 시스템 현황을 확인하세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => (
                <Card key={stat.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>최근 활동</CardTitle>
                  <CardDescription>
                    시스템에서 발생한 최근 활동들을 확인하세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">새로운 사용자가 가입했습니다</p>
                        <p className="text-xs text-gray-500">2분 전</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">프로그램이 승인되었습니다</p>
                        <p className="text-xs text-gray-500">1시간 전</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">신청서가 제출되었습니다</p>
                        <p className="text-xs text-gray-500">3시간 전</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>빠른 작업</CardTitle>
                  <CardDescription>
                    자주 사용하는 기능들에 빠르게 접근하세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50">
                      <div className="font-medium">새 프로그램 생성</div>
                      <div className="text-sm text-gray-500">새로운 프로그램을 등록하세요</div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50">
                      <div className="font-medium">신청서 검토</div>
                      <div className="text-sm text-gray-500">대기 중인 신청서를 확인하세요</div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50">
                      <div className="font-medium">방문 일정 등록</div>
                      <div className="text-sm text-gray-500">새로운 방문 일정을 등록하세요</div>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
