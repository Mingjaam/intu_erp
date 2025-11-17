'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Program } from '@/types/program';
import { LoginDialog } from './login-dialog';

const statusLabels = {
  draft: '신청전',
  open: '신청중',
  closed: '진행중',
  ongoing: '진행중',
  completed: '완료',
  archived: '보관',
  before_application: '신청전',
  application_open: '신청중',
  in_progress: '진행중',
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  open: 'bg-green-100 text-green-800',
  closed: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-blue-100 text-blue-800',
  completed: 'bg-purple-100 text-purple-800',
  archived: 'bg-yellow-100 text-yellow-800',
  before_application: 'bg-gray-100 text-gray-800',
  application_open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
};

interface ProgramsListProps {
  programs: Program[];
}

export function ProgramsList({ programs }: ProgramsListProps) {
  const [loginDialog, setLoginDialog] = useState<{
    isOpen: boolean;
    programId: string;
    programTitle: string;
  }>({
    isOpen: false,
    programId: '',
    programTitle: '',
  });

  // UTC 기준으로 날짜 포맷팅하여 서버/클라이언트 일관성 유지
  const formatDateShort = (dateString: string | undefined | null) => {
    if (!dateString) return '미정';
    try {
      // UTC 기준으로 파싱하여 서버/클라이언트 일관성 유지
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '미정';
      // UTC 기준으로 월/일 추출
      const month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      return `${month}/${day}`;
    } catch {
      return '미정';
    }
  };

  const closeLoginDialog = () => {
    setLoginDialog({
      isOpen: false,
      programId: '',
      programTitle: '',
    });
  };

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {programs && programs.length > 0 ? programs.map((program, index) => {
          const gradientColors = [
            'from-blue-500 to-blue-600',
            'from-green-500 to-green-600',
            'from-purple-500 to-purple-600',
            'from-pink-500 to-pink-600',
            'from-orange-500 to-orange-600',
            'from-teal-500 to-teal-600'
          ];
          const gradientColor = gradientColors[index % gradientColors.length];
          
          return (
            <Link key={program.id} href={`/programs/${program.id}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 bg-white border-0 overflow-hidden cursor-pointer flex flex-col rounded-lg">
                {/* 이미지 영역 - 세로로 긴 3:4 비율 */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-lg">
                  {program.imageUrl ? (
                    <div className="relative w-full h-full rounded-t-lg overflow-hidden">
                      {/* 흐림 배경 - 빈 공간 채우기 */}
                      <div 
                        className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-md scale-110 rounded-t-lg"
                        style={{ backgroundImage: `url(${program.imageUrl})` }}
                      />
                      {/* 메인 이미지 - 3:4 비율에 맞춤 */}
                      <Image
                        src={program.imageUrl}
                        alt={program.title}
                        fill
                        className="relative z-10 object-contain rounded-t-lg group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradientColor} flex items-center justify-center rounded-t-lg`}>
                      <div className="text-white text-center">
                        <Calendar className="h-12 w-12 mx-auto mb-2 opacity-80" />
                        <p className="text-sm font-medium">프로그램 이미지</p>
                      </div>
                    </div>
                  )}
                  {/* 상태 배지 */}
                  <div className="absolute top-3 right-3 z-20">
                    <Badge className={`${statusColors[program.status as keyof typeof statusColors]} px-2 py-1 rounded-full text-xs font-medium shadow-lg border-0`}>
                      {statusLabels[program.status as keyof typeof statusLabels]}
                    </Badge>
                  </div>
                  {/* D-Day 배지 - 클라이언트에서만 렌더링하여 hydration 에러 방지 */}
                  {program.status === 'application_open' && typeof program.daysUntilDeadline === 'number' && (
                    <div className="absolute top-3 left-3 z-20" suppressHydrationWarning>
                      <Badge 
                        className={`px-2 py-1 rounded-full text-xs font-bold shadow-lg ${
                          program.daysUntilDeadline <= 3 
                            ? 'bg-red-500 text-white' 
                            : program.daysUntilDeadline <= 7 
                            ? 'bg-orange-500 text-white' 
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        {program.daysUntilDeadline > 0 
                          ? `D-${program.daysUntilDeadline}` 
                          : program.daysUntilDeadline === 0 
                          ? 'D-Day' 
                          : '마감됨'
                        }
                      </Badge>
                    </div>
                  )}
                </div>
                
                {/* 정보 영역 - 이미지 아래 */}
                <div className="p-4 flex flex-col flex-1">
                  {/* 활동 기간 - UTC 기준으로 포맷팅하여 서버/클라이언트 일관성 유지 */}
                  <div className="text-sm text-gray-600 mb-3" suppressHydrationWarning>
                    진행: {formatDateShort(program.programStart)} - {formatDateShort(program.programEnd)}
                  </div>
                  
                  {/* 제목 */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 flex-1">
                    {program.title}
                  </h3>
                  
                  {/* 마을 이름 */}
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-auto">
                    <MapPin className="h-4 w-4" />
                    {program.organizer?.name || '마을'}
                  </div>
                </div>
              </Card>
            </Link>
          );
        }) : null}
      </div>

      {programs && programs.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">등록된 프로그램이 없습니다</h3>
          <p className="text-gray-600">새로운 프로그램이 등록되면 알려드리겠습니다.</p>
        </div>
      )}

      <LoginDialog
        isOpen={loginDialog.isOpen}
        programTitle={loginDialog.programTitle}
        onClose={closeLoginDialog}
      />
    </>
  );
}

