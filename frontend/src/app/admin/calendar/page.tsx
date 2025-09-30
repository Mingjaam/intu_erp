'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSearchParams } from 'next/navigation';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  X,
  ChevronLeft,
  ChevronRight,
  Repeat
} from 'lucide-react';
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
  isRecurring?: boolean;
  recurringDays?: number[];
  startDate?: string;
  endDate?: string;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTodo, setNewTodo] = useState({
    title: '',
    date: '',
    isRecurring: false,
    recurringDays: [] as number[],
    startDate: '',
    endDate: ''
  });

  // 한국 시간으로 날짜 포맷팅 (YYYY-MM-DD 형식)
  const formatToKoreanDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


  // 현재 월의 날짜들 계산
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];
    
    // 이전 달의 마지막 날들
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      const fullDate = formatToKoreanDate(date);
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
        fullDate
      });
    }
    
    // 현재 달의 날짜들
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const fullDate = formatToKoreanDate(date);
      const isToday = new Date().toDateString() === date.toDateString();
      days.push({
        date: day,
        isCurrentMonth: true,
        isToday,
        fullDate
      });
    }
    
    // 다음 달의 첫 번째 날들
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const fullDate = formatToKoreanDate(date);
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: false,
        fullDate
      });
    }

    return days;
  };

  // 특정 날짜의 할 일 가져오기 (완료된 것들을 아래로)
  const getTodosForDate = (date: string) => {
    const dateTodos = todos.filter(todo => todo.date === date);
    return dateTodos.sort((a, b) => {
      // 완료되지 않은 것들을 먼저, 완료된 것들을 나중에
      if (a.completed === b.completed) return 0;
      return a.completed ? 1 : -1;
    });
  };

  // 반복 투두 생성

  // 할 일 추가
  const handleAddTodo = async () => {
    if (!newTodo.title.trim() || !newTodo.date) {
      toast.error('제목과 날짜를 입력해주세요.');
      return;
    }

    if (newTodo.isRecurring && (!newTodo.startDate || !newTodo.endDate || newTodo.recurringDays.length === 0)) {
      toast.error('반복 설정을 완료해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      
      if (newTodo.isRecurring) {
        // 반복 투두의 경우 각 날짜별로 개별 API 호출
        const startDate = new Date(newTodo.startDate);
        const endDate = new Date(newTodo.endDate);
        
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dayOfWeek = date.getDay();
          if (newTodo.recurringDays.includes(dayOfWeek)) {
            const todoData = {
              title: newTodo.title,
              date: formatToKoreanDate(date)
            };
            
            await apiClient.post(API_ENDPOINTS.TODOS.CREATE, todoData);
          }
        }
      } else {
        // 단일 투두
        const todoData = {
          title: newTodo.title,
          date: newTodo.date
        };
        
        await apiClient.post(API_ENDPOINTS.TODOS.CREATE, todoData);
      }

      // 할 일 목록 다시 불러오기
      const response = await apiClient.get(API_ENDPOINTS.TODOS.LIST);
      setTodos(Array.isArray(response) ? response : []);
      
      setNewTodo({ 
        title: '', 
        date: '',
        isRecurring: false,
        recurringDays: [],
        startDate: '',
        endDate: ''
      });
      setShowAddForm(false);
      setShowCreateDialog(false);
      toast.success('할 일이 추가되었습니다.');
    } catch (error) {
      console.error('할 일 추가 오류:', error);
      toast.error('할 일 추가에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 할 일 완료 토글
  const handleToggleComplete = async (todoId: string) => {
    try {
      await apiClient.patch(API_ENDPOINTS.TODOS.TOGGLE(todoId));
      
      // 할 일 목록 다시 불러오기
      const response = await apiClient.get(API_ENDPOINTS.TODOS.LIST);
      setTodos(Array.isArray(response) ? response : []);
      
      toast.success('할 일 상태가 변경되었습니다.');
    } catch (error) {
      console.error('할 일 상태 변경 오류:', error);
      toast.error('할 일 상태 변경에 실패했습니다.');
    }
  };

  // 할 일 삭제
  const handleDeleteTodo = async (todoId: string) => {
    try {
      await apiClient.delete(API_ENDPOINTS.TODOS.DELETE(todoId));
      
      // 할 일 목록 다시 불러오기
      const response = await apiClient.get(API_ENDPOINTS.TODOS.LIST);
      setTodos(Array.isArray(response) ? response : []);
      
      toast.success('할 일이 삭제되었습니다.');
    } catch (error) {
      console.error('할 일 삭제 오류:', error);
      toast.error('할 일 삭제에 실패했습니다.');
    }
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

  // 날짜 클릭
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setNewTodo(prev => ({ ...prev, date }));
    setShowAddDialog(true);
    setShowAddForm(false);
  };

  // 할 일 목록 불러오기
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        console.log('할 일 목록 조회 시작...');
        const response = await apiClient.get(API_ENDPOINTS.TODOS.LIST);
        console.log('할 일 목록 응답:', response);
        setTodos(Array.isArray(response) ? response : []);
        console.log('할 일 목록 설정됨:', response || []);
      } catch (error) {
        console.error('할 일 목록 조회 오류:', error);
      }
    };

    if (user) {
      console.log('사용자 정보:', user);
      fetchTodos();
    }
  }, [user]);

  // URL 파라미터에서 날짜 가져와서 다이얼로그 열기
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setSelectedDate(dateParam);
      setNewTodo(prev => ({ ...prev, date: dateParam }));
      setShowAddDialog(true);
      setShowAddForm(false);
    }
  }, [searchParams]);

  // 요일 이름 배열
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  if (!user || (user.role !== 'admin' && user.role !== 'operator' && user.role !== 'staff')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">캘린더에 접근할 권한이 없습니다.</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">캘린더</h1>
            <p className="text-gray-600">마을 직원들과 공유하는 할 일 관리</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            할 일 추가
          </Button>
        </div>
      </div>

      {/* 캘린더 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => changeMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => changeMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map((day, index) => {
              const dayTodos = getTodosForDate(day.fullDate);
              const hasTodos = dayTodos.length > 0;
              const completedTodos = dayTodos.filter(todo => todo.completed).length;
              
              return (
                <div
                  key={index}
                  className={`
                    h-40 p-2 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 overflow-hidden
                    ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                    ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                  `}
                  onClick={() => handleDateClick(day.fullDate)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${
                      day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {day.date}
                    </span>
                    {hasTodos && (
                      <Badge variant="secondary" className="text-xs">
                        {completedTodos}/{dayTodos.length}
                      </Badge>
                    )}
                  </div>
                  
                  {/* 할 일 목록 (최대 3개) */}
                  <div className="space-y-1">
                    {dayTodos.slice(0, 3).map((todo) => (
                      <div
                        key={todo.id}
                        className={`text-xs p-1 rounded truncate ${
                          todo.completed 
                            ? 'bg-green-100 text-green-800 line-through' 
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {todo.title}
                      </div>
                    ))}
                    {dayTodos.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayTodos.length - 3}개 더
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 할 일 추가 다이얼로그 */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {selectedDate} 할 일 관리
            </DialogTitle>
          </DialogHeader>
          
          {/* 오늘의 할 일 목록 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">오늘의 할 일</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {getTodosForDate(selectedDate).map((todo) => (
                <div key={todo.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => handleToggleComplete(todo.id)}
                    />
                    <span className={`text-sm ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {todo.title}
                    </span>
                    {todo.isRecurring && (
                      <Badge variant="secondary" className="text-xs">
                        <Repeat className="h-3 w-3 mr-1" />
                        반복
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTodo(todo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {getTodosForDate(selectedDate).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">등록된 할 일이 없습니다.</p>
              )}
            </div>
          </div>

          {/* 새 할 일 추가 */}
          {!showAddForm ? (
            <div className="text-center py-4">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              새 할 일 추가
            </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">새 할 일 추가</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="할 일 제목을 입력하세요"
                />
              </div>
              
              
              <div>
                <Label htmlFor="date">날짜 *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTodo.date}
                  onChange={(e) => setNewTodo(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>

              {/* 반복 설정 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurring"
                    checked={newTodo.isRecurring}
                    onCheckedChange={(checked) => setNewTodo(prev => ({ ...prev, isRecurring: checked as boolean }))}
                  />
                  <Label htmlFor="isRecurring" className="flex items-center">
                    <Repeat className="h-4 w-4 mr-1" />
                    반복 설정
                  </Label>
                </div>

                {newTodo.isRecurring && (
                  <div className="space-y-3 pl-6 border-l-2 border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="startDate">시작 날짜</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={newTodo.startDate}
                          onChange={(e) => setNewTodo(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="endDate">종료 날짜</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={newTodo.endDate}
                          onChange={(e) => setNewTodo(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>반복 요일</Label>
                      <div className="grid grid-cols-7 gap-2 mt-2">
                        {dayNames.map((day, index) => (
                          <div key={index} className="flex flex-col items-center">
                            <Checkbox
                              id={`day-${index}`}
                              checked={newTodo.recurringDays.includes(index)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewTodo(prev => ({ 
                                    ...prev, 
                                    recurringDays: [...prev.recurringDays, index] 
                                  }));
                                } else {
                                  setNewTodo(prev => ({ 
                                    ...prev, 
                                    recurringDays: prev.recurringDays.filter(d => d !== index) 
                                  }));
                                }
                              }}
                            />
                            <Label htmlFor={`day-${index}`} className="text-xs mt-1">
                              {day}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              취소
            </Button>
            {showAddForm && (
              <Button onClick={handleAddTodo} disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                {isLoading ? '추가 중...' : '추가'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 새 할 일 생성 다이얼로그 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              새 할 일 추가
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-title">제목 *</Label>
              <Input
                id="create-title"
                value={newTodo.title}
                onChange={(e) => setNewTodo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="할 일 제목을 입력하세요"
              />
            </div>
            
            <div>
            </div>
            
            <div>
              <Label htmlFor="create-date">날짜 *</Label>
              <Input
                id="create-date"
                type="date"
                value={newTodo.date}
                onChange={(e) => setNewTodo(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            {/* 반복 설정 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create-isRecurring"
                  checked={newTodo.isRecurring}
                  onCheckedChange={(checked) => setNewTodo(prev => ({ ...prev, isRecurring: checked as boolean }))}
                />
                <Label htmlFor="create-isRecurring" className="flex items-center">
                  <Repeat className="h-4 w-4 mr-1" />
                  반복 설정
                </Label>
              </div>

              {newTodo.isRecurring && (
                <div className="space-y-3 pl-6 border-l-2 border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="create-startDate">시작 날짜</Label>
                      <Input
                        id="create-startDate"
                        type="date"
                        value={newTodo.startDate}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="create-endDate">종료 날짜</Label>
                      <Input
                        id="create-endDate"
                        type="date"
                        value={newTodo.endDate}
                        onChange={(e) => setNewTodo(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>반복 요일</Label>
                    <div className="grid grid-cols-7 gap-2 mt-2">
                      {dayNames.map((day, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <Checkbox
                            id={`create-day-${index}`}
                            checked={newTodo.recurringDays.includes(index)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewTodo(prev => ({ 
                                  ...prev, 
                                  recurringDays: [...prev.recurringDays, index] 
                                }));
                              } else {
                                setNewTodo(prev => ({ 
                                  ...prev, 
                                  recurringDays: prev.recurringDays.filter(d => d !== index) 
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={`create-day-${index}`} className="text-xs mt-1">
                            {day}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              취소
            </Button>
            <Button onClick={handleAddTodo} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              {isLoading ? '추가 중...' : '추가'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
