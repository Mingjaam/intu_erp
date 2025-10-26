'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  FolderOpen, 
  FileText, 
  Download,
  Activity,
  RefreshCw,
  Plus,
  Calendar,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Todo {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

// 작은 캘린더 컴포넌트
function MiniCalendar({ onDateClick, todos, programs }: { onDateClick?: (date: string) => void; todos?: Todo[]; programs?: any[] }) {
  console.log('MiniCalendar 렌더링됨, programs:', programs?.length || 0);
  
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDate = today.getDate();

  // 현재 월의 첫 번째 날과 마지막 날
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  // 달력에 표시할 날짜들
  const calendarDays = [];
  
  // 이전 달의 마지막 날들 (빈 칸 채우기)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    calendarDays.push({
      date: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  // 현재 달의 날짜들
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === currentDate && 
                   today.getMonth() === currentMonth && 
                   today.getFullYear() === currentYear;
    calendarDays.push({
      date: day,
      isCurrentMonth: true,
      isToday: isToday
    });
  }
  
  // 다음 달의 첫 번째 날들 (빈 칸 채우기)
  const remainingDays = 35 - calendarDays.length; // 5주 * 7일 = 35
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: day,
      isCurrentMonth: false,
      isToday: false
    });
  }

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  // 특정 날짜의 할 일 가져오기
  const getTodosForDate = (day: number) => {
    if (!todos || !day) return [];
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return todos.filter(todo => todo.date === dateStr);
  };

  // 특정 날짜의 프로그램 가져오기
  const getProgramsForDate = (day: number) => {
    if (!programs || !day || programs.length === 0) return [];
    
    // 날짜 문자열을 생성하여 정확한 날짜 비교
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const targetDate = new Date(dateStr);
    
    const filteredPrograms = programs.filter(program => {
      if (!program.applyStart || !program.applyEnd || !program.programStart || !program.programEnd) {
        return false;
      }
      
      const appStart = new Date(program.applyStart);
      const appEnd = new Date(program.applyEnd);
      const actStart = new Date(program.programStart);
      const actEnd = new Date(program.programEnd);
      
      const isInApplicationPeriod = targetDate >= appStart && targetDate <= appEnd;
      const isInActivityPeriod = targetDate >= actStart && targetDate <= actEnd;
      
      return isInApplicationPeriod || isInActivityPeriod;
    });
    
    return filteredPrograms;
  };

  // 프로그램 기간을 연속된 날짜로 표시하는 함수
  // const getProgramPeriods = () => {
    if (!programs || programs.length === 0) return [];
    
    const periods = [];
    
    programs.forEach(program => {
      if (!program.applyStart || !program.applyEnd || !program.programStart || !program.programEnd) {
        return;
      }
      
      const appStart = new Date(program.applyStart);
      const appEnd = new Date(program.applyEnd);
      const actStart = new Date(program.programStart);
      const actEnd = new Date(program.programEnd);
      
      // 신청 기간 추가 (현재 월과 겹치는 경우)
      const appStartMonth = appStart.getMonth();
      const appStartYear = appStart.getFullYear();
      const appEndMonth = appEnd.getMonth();
      const appEndYear = appEnd.getFullYear();
      
      if ((appStartMonth === currentMonth && appStartYear === currentYear) || 
          (appEndMonth === currentMonth && appEndYear === currentYear) ||
          (appStartYear < currentYear && appEndYear > currentYear) ||
          (appStartYear === currentYear && appEndYear === currentYear && appStartMonth <= currentMonth && appEndMonth >= currentMonth)) {
        
        const startDate = appStartMonth === currentMonth && appStartYear === currentYear ? appStart.getDate() : 1;
        const endDate = appEndMonth === currentMonth && appEndYear === currentYear ? 
          Math.min(appEnd.getDate(), new Date(currentYear, currentMonth + 1, 0).getDate()) : 
          new Date(currentYear, currentMonth + 1, 0).getDate();
        
        periods.push({
          type: 'application',
          program: program,
          start: startDate,
          end: endDate,
          color: 'bg-orange-400'
        });
      }
      
      // 활동 기간 추가 (현재 월과 겹치는 경우)
      const actStartMonth = actStart.getMonth();
      const actStartYear = actStart.getFullYear();
      const actEndMonth = actEnd.getMonth();
      const actEndYear = actEnd.getFullYear();
      
      if ((actStartMonth === currentMonth && actStartYear === currentYear) || 
          (actEndMonth === currentMonth && actEndYear === currentYear) ||
          (actStartYear < currentYear && actEndYear > currentYear) ||
          (actStartYear === currentYear && actEndYear === currentYear && actStartMonth <= currentMonth && actEndMonth >= currentMonth)) {
        
        const startDate = actStartMonth === currentMonth && actStartYear === currentYear ? actStart.getDate() : 1;
        const endDate = actEndMonth === currentMonth && actEndYear === currentYear ? 
          Math.min(actEnd.getDate(), new Date(currentYear, currentMonth + 1, 0).getDate()) : 
          new Date(currentYear, currentMonth + 1, 0).getDate();
        
        periods.push({
          type: 'activity',
          program: program,
          start: startDate,
          end: endDate,
          color: 'bg-purple-400'
        });
      }
    });
    
    return periods;
  // };

  return (
    <div className="w-full">
      {/* 월/년도 헤더 */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {currentYear}년 {monthNames[currentMonth]}
        </h3>
      </div>
      
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`
              h-15 flex items-start justify-start text-xs rounded-md cursor-pointer relative
              ${day.isCurrentMonth 
                ? 'text-gray-900 hover:bg-gray-100' 
                : 'text-gray-400'
              }
              ${day.isToday 
                ? 'bg-sky-100 text-sky-700 font-bold' 
                : ''
              }
            `}
            onClick={() => {
              if (onDateClick && day.isCurrentMonth) {
                const date = new Date(currentYear, currentMonth, day.date);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const dayStr = String(date.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${dayStr}`;
                onDateClick(dateString);
              }
            }}
          >
            <span className="absolute top-1 left-1 text-xs">
              {day.date}
            </span>
            {/* 프로그램 기간 표시 (날짜 숫자 아래) */}
            {day.isCurrentMonth && (
              <div className="absolute top-6 left-1 right-1">
                {getProgramsForDate(day.date).map((program, programIndex) => {
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day.date).padStart(2, '0')}`;
                  const targetDate = new Date(dateStr);
                  const appStart = new Date(program.applyStart);
                  const appEnd = new Date(program.applyEnd);
                  const actStart = new Date(program.programStart);
                  const actEnd = new Date(program.programEnd);
                  
                  const isApplicationPeriod = targetDate >= appStart && targetDate <= appEnd;
                  const isActivityPeriod = targetDate >= actStart && targetDate <= actEnd;
                  
                  return (
                    <div
                      key={`program-${programIndex}`}
                      className={`h-1 w-full rounded mb-0.5 ${
                        isApplicationPeriod ? 'bg-orange-400' : 'bg-purple-400'
                      }`}
                      title={`${program.title} - ${isApplicationPeriod ? '신청기간' : '활동기간'}`}
                    />
                  );
                })}
              </div>
            )}
            
            {/* 할 일 표시 */}
            {day.isCurrentMonth && (
              <div className="absolute top-9 left-1 right-1 flex flex-wrap gap-0.5">
                {getTodosForDate(day.date).slice(0, 11).map((todo, todoIndex) => (
                  <div
                    key={`todo-${todoIndex}`}
                    className={`w-1.5 h-1.5 rounded-full ${
                      todo.completed ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    title={todo.title}
                  />
                ))}
                {getTodosForDate(day.date).length > 11 && (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400" title={`+${getTodosForDate(day.date).length - 11}개 더`} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalPrograms: number;
    totalApplications: number;
    totalSelections: number;
    totalVisits: number;
    totalOrganizations: number;
    totalRevenue: number;
    activePrograms: number;
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
  const [todos, setTodos] = useState<Todo[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [showTodoDialog, setShowTodoDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

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

  const fetchTodos = useCallback(async () => {
    try {
      const response = await apiClient.get('/todos');
      setTodos(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('할 일 목록 조회 오류:', error);
    }
  }, []);

  const fetchPrograms = useCallback(async () => {
    try {
      console.log('프로그램 목록 조회 시작...');
      // 캐시 무효화를 위해 타임스탬프 추가
      const response = await apiClient.get(`/programs?t=${Date.now()}`);
      console.log('프로그램 목록 응답:', response);
      
      // API 응답 구조 확인
      let programsData: Program[] = [];
      if (Array.isArray(response)) {
        programsData = response;
      } else if (response && Array.isArray(response.data)) {
        programsData = response.data;
      } else if (response && response.programs && Array.isArray(response.programs)) {
        programsData = response.programs;
      }
      
      // 삭제된 프로그램(isActive: false) 필터링
      const activePrograms = programsData.filter((program: Program) => program.isActive !== false);
      
      setPrograms(activePrograms);
      console.log('프로그램 목록 설정됨:', activePrograms);
      console.log('프로그램 개수:', activePrograms.length);
    } catch (error) {
      console.error('프로그램 목록 조회 오류:', error);
    }
  }, []);

  // 다이얼로그용 프로그램 조회 함수 (날짜 문자열 사용)
  const getProgramsForDateString = (dateString: string) => {
    if (!programs || !dateString || programs.length === 0) return [];
    const targetDate = new Date(dateString);
    
    return programs.filter(program => {
      if (!program.applyStart || !program.applyEnd || !program.programStart || !program.programEnd) {
        return false;
      }
      
      const appStart = new Date(program.applyStart);
      const appEnd = new Date(program.applyEnd);
      const actStart = new Date(program.programStart);
      const actEnd = new Date(program.programEnd);
      
      const isInApplicationPeriod = targetDate >= appStart && targetDate <= appEnd;
      const isInActivityPeriod = targetDate >= actStart && targetDate <= actEnd;
      
      return isInApplicationPeriod || isInActivityPeriod;
    });
  };

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'operator' || user?.role === 'staff') {
      fetchDashboardStats();
      fetchSystemHealth();
      fetchTodos();
      fetchPrograms();
    }
  }, [user, dateRange, fetchDashboardStats, fetchSystemHealth, fetchTodos, fetchPrograms]);

  // 프로그램 목록 주기적 새로고침 (5분마다)
  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'operator' || user?.role === 'staff') {
      const interval = setInterval(() => {
        fetchPrograms();
      }, 5 * 60 * 1000); // 5분

      return () => clearInterval(interval);
    }
  }, [user, fetchPrograms]);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setShowTodoDialog(true);
  };

  const handleExport = async (type: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/dashboard/export?type=${type}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 엑셀 파일을 Blob으로 받기
      const blob = await response.blob();
      
      // 파일 다운로드
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${type} 데이터가 성공적으로 다운로드되었습니다.`);
    } catch (error) {
      console.error('데이터 내보내기 오류:', error);
      toast.error('데이터 내보내기에 실패했습니다.');
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    fetchDashboardStats();
    fetchSystemHealth();
    fetchTodos();
    fetchPrograms();
  };

  if (!user || (user.role !== 'admin' && user.role !== 'operator' && user.role !== 'staff')) {
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
                <p className="text-sm font-medium text-gray-600">총 직원 수</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.totalUsers || 0}명</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.activePrograms || 0}개</p>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 신청자 수</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview.totalApplications || 0}명</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 왼쪽: 오늘의 할 일 + 최근 프로그램 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 오늘의 할 일 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                오늘의 할 일
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 h-28 overflow-y-auto">
                {todos.filter(todo => {
                  const today = new Date();
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  return todo.date === todayStr;
                }).sort((a, b) => {
                  // 미완료를 먼저, 완료된 것을 나중에
                  if (a.completed === b.completed) return 0;
                  return a.completed ? 1 : -1;
                }).map((todo) => (
                  <div key={todo.id} className="flex h-12 items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 flex-1">
                      <Checkbox
                        checked={todo.completed}
                        onCheckedChange={async () => {
                          try {
                            await apiClient.patch(`/todos/${todo.id}/toggle`);
                            await fetchTodos();
                            toast.success('할 일 상태가 변경되었습니다.');
                          } catch (error) {
                            console.error('할 일 상태 변경 오류:', error);
                            toast.error('할 일 상태 변경에 실패했습니다.');
                          }
                        }}
                      />
                      <span className={`text-sm font-medium truncate ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {todo.title}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await apiClient.delete(`/todos/${todo.id}`);
                          // 즉시 UI에서 제거
                          setTodos(prevTodos => prevTodos.filter(t => t.id !== todo.id));
                          toast.success('할 일이 삭제되었습니다.');
                        } catch (error) {
                          console.error('할 일 삭제 오류:', error);
                          toast.error('할 일 삭제에 실패했습니다.');
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {todos.filter(todo => {
                  const today = new Date();
                  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                  return todo.date === todayStr;
                }).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">오늘 등록된 할 일이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 최근 프로그램 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="h-5 w-5 mr-2" />
                최근 프로그램
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recent.programs?.slice(0, 1).map((program: Record<string, unknown>) => (
                  <div key={program.id as string} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">{program.title as string}</h4>
                          <Link href={`/admin/programs/${program.id as string}/applications`}>
                            <Button size="sm" variant="outline" className="text-xs ml-2">
                              <Users className="h-3 w-3 mr-1" />
                              신청서 보기
                            </Button>
                          </Link>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs border-0 ${statusColors[program.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                            {statusLabels[program.status as keyof typeof statusLabels] || (program.status as string)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(program.createdAt as string).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 신청자 수 - 더 크고 눈에 띄게 */}
                    <div className="mb-3 p-2 bg-blue-50 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-700">신청자</span>
                        <span className="text-lg font-bold text-blue-800">
                          {(program.applicationCount as number) || 0}/{(program.maxParticipants as number) || 0}명
                        </span>
                      </div>
                    </div>

                    {/* 기간 정보 */}
                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>신청: {program.applyStart ? new Date(program.applyStart as string).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '미정'} ~ {program.applyEnd ? new Date(program.applyEnd as string).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '미정'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>활동: {program.programStart ? new Date(program.programStart as string).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '미정'} ~ {program.programEnd ? new Date(program.programEnd as string).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) : '미정'}</span>
                      </div>
                    </div>

                  </div>
                )) || (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    최근 프로그램이 없습니다.
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <Link href="/admin/programs">
                  <Button variant="outline" size="sm" className="w-full">
                    <FolderOpen className="h-4 w-4 mr-2" />
                    프로그램 관리
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 캘린더 */}
        <div className="lg:col-span-1">
          <Card className="h-[590px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  캘린더
                </CardTitle>
                <Link href="/admin/calendar">
                  <Button size="sm" variant="outline">
                    전체 보기
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <div className="h-full">
                <MiniCalendar 
                  onDateClick={handleDateClick}
                  todos={todos}
                  programs={programs}
                />
              </div>
            </CardContent>
          </Card>
        </div>
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

      {/* 할 일 다이얼로그 */}
      <Dialog open={showTodoDialog} onOpenChange={setShowTodoDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {selectedDate} 할 일 관리
            </DialogTitle>
          </DialogHeader>
          
          {/* 프로그램 기간 정보 */}
          {getProgramsForDateString(selectedDate).length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border">
              <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center">
                <FolderOpen className="h-4 w-4 mr-2" />
                프로그램 기간
              </h3>
              <div className="space-y-2">
                {getProgramsForDateString(selectedDate).map((program) => {
                  const targetDate = new Date(selectedDate);
                  const appStart = new Date(program.applyStart);
                  const appEnd = new Date(program.applyEnd);
                  const actStart = new Date(program.programStart);
                  const actEnd = new Date(program.programEnd);
                  
                  const isApplicationPeriod = targetDate >= appStart && targetDate <= appEnd;
                  const isActivityPeriod = targetDate >= actStart && targetDate <= actEnd;
                  
                  return (
                    <div key={program.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{program.title}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            isApplicationPeriod 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {isApplicationPeriod ? '신청기간' : '활동기간'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {isApplicationPeriod 
                            ? `신청: ${appStart.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })} ~ ${appEnd.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}`
                            : `활동: ${new Date(program.programStart).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })} ~ ${new Date(program.programEnd).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}`
                          }
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* 해당 날짜의 할 일 목록 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">할 일 목록</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {todos.filter(todo => todo.date === selectedDate)
                .sort((a, b) => {
                  // 미완료를 먼저, 완료된 것을 나중에
                  if (a.completed === b.completed) return 0;
                  return a.completed ? 1 : -1;
                })
                .map((todo) => (
                <div key={todo.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={async () => {
                        try {
                          await apiClient.patch(`/todos/${todo.id}/toggle`);
                          await fetchTodos();
                          toast.success('할 일 상태가 변경되었습니다.');
                        } catch (error) {
                          console.error('할 일 상태 변경 오류:', error);
                          toast.error('할 일 상태 변경에 실패했습니다.');
                        }
                      }}
                    />
                    <span className={`text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {todo.title}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await apiClient.delete(`/todos/${todo.id}`);
                          // 즉시 UI에서 제거
                          setTodos(prevTodos => prevTodos.filter(t => t.id !== todo.id));
                          toast.success('할 일이 삭제되었습니다.');
                        } catch (error) {
                          console.error('할 일 삭제 오류:', error);
                          toast.error('할 일 삭제에 실패했습니다.');
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {todos.filter(todo => todo.date === selectedDate).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">등록된 할 일이 없습니다.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowTodoDialog(false)}>
              닫기
            </Button>
            <Button onClick={() => {
              setShowTodoDialog(false);
              window.location.href = `/admin/calendar?date=${selectedDate}`;
            }}>
              <Plus className="h-4 w-4 mr-2" />
              할 일 추가
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}