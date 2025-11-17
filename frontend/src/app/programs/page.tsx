import type { Metadata } from 'next';
import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { ProgramsList } from '@/components/programs/programs-list';
import { Program } from '@/types/program';

// 동적 렌더링 명시 (프로그램 목록은 실시간으로 변경될 수 있음)
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nuvio.kr';

export const metadata: Metadata = {
  title: '마을 프로그램 | Nuvio',
  description: '함께 성장하는 마을을 위한 다양한 프로그램을 만나보세요',
  alternates: {
    canonical: `${SITE_URL}/programs`,
  },
  openGraph: {
    title: '마을 프로그램 | Nuvio',
    description: '함께 성장하는 마을을 위한 다양한 프로그램을 만나보세요',
    url: `${SITE_URL}/programs`,
    siteName: 'Nuvio',
    images: [
      {
        url: `${SITE_URL}/og-image-default.jpg`,
        width: 1200,
        height: 630,
        alt: 'Nuvio 마을 프로그램',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '마을 프로그램 | Nuvio',
    description: '함께 성장하는 마을을 위한 다양한 프로그램을 만나보세요',
    images: [`${SITE_URL}/og-image-default.jpg`],
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
    let programs: Program[] = [];
    if (data.programs && Array.isArray(data.programs)) {
      programs = data.programs;
    } else if (Array.isArray(data)) {
      programs = data;
    }
    
    // organizer가 없는 경우 기본값 설정하여 hydration 에러 방지
    return programs.map(program => {
      // organizer 객체가 없거나 필수 필드가 없는 경우 기본값 설정
      const organizer = program.organizer && program.organizer.id && program.organizer.name
        ? program.organizer
        : { id: program.organizerId || '', name: '마을', type: 'village' };
      
      return {
        ...program,
        organizer,
      };
    });
  } catch (error) {
    console.error('프로그램 목록 조회 오류:', error);
    return [];
  }
}

// 구조화된 데이터 생성 (프로그램 목록)
function generateStructuredData(programs: Program[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '마을 프로그램',
    description: '함께 성장하는 마을을 위한 다양한 프로그램을 만나보세요',
    url: `${SITE_URL}/programs`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: programs.length,
      itemListElement: programs.slice(0, 10).map((program, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Event',
          '@id': `${SITE_URL}/programs/${program.id}`,
          name: program.title,
          description: program.summary || program.description?.substring(0, 200),
          image: program.imageUrl || `${SITE_URL}/og-image-default.jpg`,
          url: `${SITE_URL}/programs/${program.id}`,
          startDate: program.programStart,
          endDate: program.programEnd,
          location: {
            '@type': 'Place',
            name: program.location || '미정',
          },
          organizer: {
            '@type': 'Organization',
            name: program.organizer?.name || '마을',
          },
        },
      })),
    },
  };
}

export default async function ProgramsPage() {
  const programs = await getPrograms();
  const openProgramsCount = programs.filter(
    p => p.status === 'application_open' || p.status === 'open'
  ).length;

  const structuredData = generateStructuredData(programs);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <HeaderWrapper />
      
      {/* 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="pb-16 md:pb-0">
        <div className="container mx-auto px-6 py-8">
          {/* 히어로 섹션 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-4">
              청년 마을 프로그램
            </h1>
            <p className="text-xl text-gray-600 mb-6">함께 성장하는 마을을 위한 다양한 프로그램을 만나보세요</p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <span className="text-sm font-medium text-gray-700" suppressHydrationWarning>
                  총 {programs.length}개의 프로그램
                </span>
              </div>
              {openProgramsCount > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                  <span className="text-sm font-medium text-gray-700" suppressHydrationWarning>
                    지금 신청 가능
                  </span>
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
