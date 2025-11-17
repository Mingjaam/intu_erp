import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HeaderWrapper } from '@/components/layout/header-wrapper';
import { ProgramDetailContent } from '@/components/programs/program-detail-content';
import { Program } from '@/types/program';

// 동적 렌더링 명시
export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuvio.kr/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nuvio.kr';

async function getProgram(id: string): Promise<Program | null> {
  try {
    const response = await fetch(`${API_URL}/programs/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('프로그램을 불러오는데 실패했습니다.');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('프로그램 조회 오류:', error);
    return null;
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const program = await getProgram(params.id);

  if (!program) {
    return {
      title: '프로그램을 찾을 수 없습니다 | Nuvio',
    };
  }

  const title = `${program.title} | Nuvio`;
  const description = program.summary || program.description?.substring(0, 160) || '함께 성장하는 마을을 위한 프로그램입니다.';
  const imageUrl = program.imageUrl || `${SITE_URL}/og-image-default.jpg`;
  const url = `${SITE_URL}/programs/${program.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Nuvio',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: program.title,
        },
      ],
      locale: 'ko_KR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

// 구조화된 데이터 생성
function generateStructuredData(program: Program) {
  const imageUrl = program.imageUrl || `${SITE_URL}/og-image-default.jpg`;
  const url = `${SITE_URL}/programs/${program.id}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: program.title,
    description: program.summary || program.description?.substring(0, 200),
    image: imageUrl,
    url,
    startDate: program.programStart,
    endDate: program.programEnd,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: program.location || '미정',
    },
    organizer: {
      '@type': 'Organization',
      name: program.organizer?.name || '마을',
    },
    offers: {
      '@type': 'Offer',
      price: program.fee === 0 ? '0' : program.fee.toString(),
      priceCurrency: 'KRW',
      availability: program.status === 'application_open' || program.status === 'open' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/SoldOut',
    },
  };
}

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  const program = await getProgram(params.id);

  if (!program) {
    notFound();
  }

  const structuredData = generateStructuredData(program);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <HeaderWrapper />
      
      {/* 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ProgramDetailContent program={program} />
    </div>
  );
}
