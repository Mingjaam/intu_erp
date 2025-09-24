'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Header } from '@/components/layout/header';
import { UserSidebar } from '@/components/layout/user-sidebar';
import { Program } from '@/types/program';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'application' | 'activity';
  date: string;
  program: Program;
  status?: string;
  description?: string;
}

const monthNames = [
  '1월', '2월', '3월', '4월', '5월', '6월',
  '7월', '8월', '9월', '10월', '11월', '12월'
];

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

export default function CalendarPage() {
  const { user, loading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 현재 월의 첫째 날과 마지막 날 계산
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // 캘린더 그리드 생성
  const calendarDays = [];
  
  // 이전 달의 마지막 날들
  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({
      date: prevMonth.getDate() - i,
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  // 현재 달의 날들
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const isToday = date.toDateString() === new Date().toDateString();
    calendarDays.push({
      date: day,
      isCurrentMonth: true,
      isToday
    });
  }
  
  // 다음 달의 첫째 날들 (캘린더를 42개로 맞추기 위해)
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      date: day,
      isCurrentMonth: false,
      isToday: false
    });
  }

  // 프로그램 데이터 로드
  useEffect(() => {
    const loadPrograms = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        const response = await apiClient.get<Program[]>(API_ENDPOINTS.PROGRAMS.LIST);
        
        // 응답 구조 확인
        const data = response.data || response;
        
        // API 응답이 배열인지 확인
        let programs: Program[] = [];
        
        if (Array.isArray(data)) {
          programs = data;
        } else if (data && typeof data === 'object') {
          // 응답이 객체인 경우 programs 속성 확인
          const dataObj = data as Record<string, unknown>;
          programs = (dataObj.programs as Program[]) || (dataObj.data as Program[]) || (dataObj.items as Program[]) || [];
        } else {
          console.error('예상치 못한 데이터 타입:', typeof data, data);
          programs = [];
        }
        
        // programs가 배열인지 다시 한번 확인
        if (!Array.isArray(programs)) {
          console.error('프로그램 데이터가 배열이 아닙니다:', programs);
          programs = [];
        }
        
        // 프로그램을 캘린더 이벤트로 변환
        const calendarEvents: CalendarEvent[] = [];
        
        // 안전한 forEach 처리
        if (Array.isArray(programs) && programs.length > 0) {
          programs.forEach(program => {
          // 신청 마감일
          if (program.applyEnd) {
            calendarEvents.push({
              id: `apply-${program.id}`,
              title: `${program.title} 신청마감`,
              type: 'application',
              date: program.applyEnd,
              program,
              status: program.status,
              description: '프로그램 신청 마감일'
            });
          }
          
          // 활동 시작일
          if (program.programStart) {
            calendarEvents.push({
              id: `activity-start-${program.id}`,
              title: `${program.title} 활동시작`,
              type: 'activity',
              date: program.programStart,
              program,
              status: program.status,
              description: '프로그램 활동 시작일'
            });
          }
          
          // 활동 종료일
          if (program.programEnd) {
            calendarEvents.push({
              id: `activity-end-${program.id}`,
              title: `${program.title} 활동종료`,
              type: 'activity',
              date: program.programEnd,
              program,
              status: program.status,
              description: '프로그램 활동 종료일'
            });
          }
          });
        } else {
          console.log('프로그램 데이터가 없거나 배열이 아닙니다. 빈 배열로 처리합니다.');
        }
        
        setEvents(calendarEvents);
      } catch (error) {
        console.error('프로그램 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrograms();
  }, [user]);

  // 특정 날짜의 이벤트 가져오기
  const getEventsForDate = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return [];
    
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    
    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateString;
    });
  };

  // 월 변경
  const changeMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
          <p className="text-gray-600">캘린더를 보려면 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Header />
      <div className="flex">
        <UserSidebar />
        <div className="flex-1 pb-16 md:pb-0">
          <div className="container mx-auto px-6 py-8">
            {/* 히어로 섹션 */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
                프로그램 캘린더
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                신청일정과 활동일정을 한눈에 확인하세요
              </p>
            </div>

            {/* 캘린더 컨트롤 */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">
                    {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => changeMonth('prev')}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => changeMonth('next')}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">일정을 불러오는 중...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {/* 요일 헤더 */}
                    {dayNames.map(day => (
                      <div key={day} className="p-2 text-center font-semibold text-gray-600 bg-gray-50 rounded">
                        {day}
                      </div>
                    ))}
                    
                    {/* 캘린더 날짜들 */}
                    {calendarDays.map((day, index) => {
                      const dayEvents = getEventsForDate(day.date, day.isCurrentMonth);
                      
                      return (
                        <div
                          key={index}
                          className={`min-h-24 p-2 border border-gray-200 rounded ${
                            day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                          } ${day.isToday ? 'bg-blue-50 border-blue-300' : ''}`}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          } ${day.isToday ? 'text-blue-600' : ''}`}>
                            {day.date}
                          </div>
                          
                          {/* 이벤트 표시 */}
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded truncate ${
                                  event.type === 'application'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                }`}
                                title={event.title}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayEvents.length - 2}개 더
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 이벤트 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 신청일정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    신청일정
                  </CardTitle>
                  <CardDescription>프로그램 신청 마감일</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events
                      .filter(event => event.type === 'application')
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(event => (
                        <div key={event.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-600">{event.program.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(event.date).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-red-600 border-red-300">
                            {event.status === 'open' ? '모집중' : event.status}
                          </Badge>
                        </div>
                      ))}
                    {events.filter(event => event.type === 'application').length === 0 && (
                      <p className="text-gray-500 text-center py-4">신청일정이 없습니다</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 활동일정 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    활동일정
                  </CardTitle>
                  <CardDescription>프로그램 활동 시작일</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events
                      .filter(event => event.type === 'activity')
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map(event => (
                        <div key={event.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-600">{event.program.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(event.date).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-300">
                            {event.status === 'open' ? '모집중' : event.status}
                          </Badge>
                        </div>
                      ))}
                    {events.filter(event => event.type === 'activity').length === 0 && (
                      <p className="text-gray-500 text-center py-4">활동일정이 없습니다</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
