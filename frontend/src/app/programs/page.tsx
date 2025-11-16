import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { ProgramsList } from '@/components/programs/programs-list';
import { Program } from '@/types/program';

export const metadata: Metadata = {
  title: '마을 프로그램 | Nuvio',
  description: '함께 성장하는 마을을 위한 다양한 프로그램을 만나보세요',
  openGraph: {
    title: '마을 프로그램 | Nuvio',
    description: '함께 성장하는 마을을 위한 다양한 프로그램을 만나보세요',
    type: 'website',
  },
};

async function getPrograms(): Promise<Program[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuvio.kr/api';
  
  try {
    const response = await fetch(`${API_URL}/programs`, {
      cache: 'no-store', // 실시간 데이터를 위해 캐시 비활성화
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('프로그램 목록을 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    // 백엔드 응답 구조에 따라 처리
    if (data.programs && Array.isArray(data.programs)) {
      return data.programs;
    } else if (Array.isArray(data)) {
      return data;
    }
    return [];
  } catch (error) {
    console.error('프로그램 목록 조회 오류:', error);
    return [];
  }
}

export default async function ProgramsPage() {
  const programs = await getPrograms();
  const openProgramsCount = programs.filter(
    p => p.status === 'application_open' || p.status === 'open'
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Header />
      <div className="pb-16 md:pb-0">
        <div className="container mx-auto px-6 py-8">
          {/* 히어로 섹션 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
              마을 프로그램
            </h1>
            <p className="text-xl text-gray-600 mb-6">함께 성장하는 마을을 위한 다양한 프로그램을 만나보세요</p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <span className="text-sm font-medium text-gray-700">총 {programs.length}개의 프로그램</span>
              </div>
              {openProgramsCount > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <span className="text-sm font-medium text-gray-700">지금 신청 가능</span>
                </div>
              )}
            </div>
          </div>

          <ProgramsList programs={programs} />
        </div>
      </div>
    </div>
  );
}
