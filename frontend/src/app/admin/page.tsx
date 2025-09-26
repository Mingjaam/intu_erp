'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FolderOpen, 
  FileText, 
  TrendingUp,
  BarChart3,
  Download,
  Activity,
  RefreshCw,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalPrograms: number;
    totalApplications: number;
    totalSelections: number;
    totalVisits: number;
    totalOrganizations: number;
    totalRevenue: number;
  };
  recent: {
    applications: Record<string, unknown>[];
    programs: Record<string, unknown>[];
    visits: Record<string, unknown>[];
  };
  charts: {
    programStats: Record<string, unknown>[];
    userRoleStats: Record<string, unknown>[];
    organizationTypeStats: Record<string, unknown>[];
    monthlyStats: Record<string, unknown>[];
    applicationTrends: Record<string, unknown>[];
    programStatusStats: Record<string, unknown>[];
  };
}

interface SystemHealth {
  totalUsers: number;
  totalPrograms: number;
  totalApplications: number;
  activePrograms: number;
  recentErrors: Record<string, unknown>[];
  healthScore: number;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  closed: 'bg-orange-100 text-orange-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  archived: 'bg-yellow-100 text-yellow-800',
};

const statusLabels = {
  draft: '신청 전',
  open: '모집중',
  closed: '신청마감',
  ongoing: '진행중',
  completed: '완료',
  archived: '보관',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await apiClient.get<DashboardStats>(`/dashboard/stats?dateRange=${dateRange}`);
      const data = response.data || response;
      setStats(data);
    } catch (error) {
      console.error('대시보드 통계 조회 오류:', error);
      toast.error('대시보드 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

  const fetchSystemHealth = useCallback(async () => {
    try {
      await apiClient.get<SystemHealth>('/dashboard/health');
      // const data = response.data || response;
      // setSystemHealth(data);
    } catch (error) {
      console.error('시스템 상태 조회 오류:', error);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'operator') {
      fetchDashboardStats();
      fetchSystemHealth();
    }
  }, [user, dateRange, fetchDashboardStats, fetchSystemHealth]);

  const handleExport = async (type: string) => {
    try {
      await apiClient.get(`/dashboard/export?type=${type}`);
      toast.success(`${type} 데이터 내보내기가 준비되었습니다.`);
    } catch (error) {
      console.error('데이터 내보내기 오류:', error);
      toast.error('데이터 내보내기에 실패했습니다.');
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchDashboardStats();
    fetchSystemHealth();
  };

  if (!user || (user.role !== 'admin' && user.role !== 'operator')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">관리자 권한이 필요한 페이지입니다.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
            <p className="text-gray-600">안녕하세요, 대표 관리자님!</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="today">오늘</option>
              <option value="week">이번 주</option>
              <option value="month">이번 달</option>
              <option value="quarter">이번 분기</option>
              <option value="year">올해</option>
            </select>
            <Button onClick={handleRefresh} disabled={isLoading} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 참여자 수</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.totalUsers || 0}명</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 매출</p>
                <p className="text-2xl font-bold text-gray-900">₩{(stats?.overview.totalRevenue || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderOpen className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">진행중인 프로그램</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.totalPrograms || 0}개</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 프로그램</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.totalPrograms || 0}개</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 프로그램 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2" />
                프로그램 목록
              </CardTitle>
              <Link href="/admin/programs/new">
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  새 프로그램
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent.programs?.slice(0, 8).map((program: Record<string, unknown>) => (
                <div key={program.id as string} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{program.title as string}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(program.createdAt as string).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={statusColors[program.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                      {statusLabels[program.status as keyof typeof statusLabels] || (program.status as string)}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">참여자</p>
                      <p className="font-medium">{(program.selectedCount as number) || 0}/{(program.maxParticipants as number) || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">매출</p>
                      <p className="font-medium">₩{((program.revenue as number) || 0).toLocaleString()}</p>
                    </div>
                    <Link href={`/programs/${program.id as string}`}>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  프로그램 데이터가 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 월별 참여자 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              월별 참여자 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.charts.monthlyStats?.slice(0, 7).map((item: Record<string, unknown>, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {new Date(item.month as string).toLocaleDateString('ko-KR', { month: 'short' })}월
                  </span>
                  <div className="flex items-center">
                    <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, ((item.count as number) / Math.max(...(stats?.charts.monthlyStats || []).map((m: Record<string, unknown>) => m.count as number))) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{item.count as number}</span>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8 text-gray-500">
                  월별 데이터가 없습니다.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 시스템 상태 */}
      {systemHealth && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                시스템 상태
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{systemHealth.healthScore}%</div>
                  <div className="text-sm text-gray-600">시스템 건강도</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{systemHealth.activePrograms}</div>
                  <div className="text-sm text-gray-600">활성 프로그램</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{systemHealth.recentErrors.length}</div>
                  <div className="text-sm text-gray-600">최근 오류</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {systemHealth.totalApplications > 0 ? 
                      Math.round((systemHealth.totalApplications / systemHealth.totalUsers) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">신청률</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 데이터 내보내기 */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              데이터 내보내기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => handleExport('users')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                사용자 데이터
              </Button>
              <Button onClick={() => handleExport('programs')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                프로그램 데이터
              </Button>
              <Button onClick={() => handleExport('applications')} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                신청서 데이터
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}