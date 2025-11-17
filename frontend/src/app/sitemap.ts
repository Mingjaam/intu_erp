import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://nuvio.kr/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nuvio.kr';

interface ProgramSitemapItem {
  id: string;
  updatedAt?: string;
  createdAt?: string;
}

async function getAllPrograms(): Promise<Array<{ id: string; updatedAt: string }>> {
  try {
    const response = await fetch(`${API_URL}/programs?limit=1000`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const programs = data.programs || (Array.isArray(data) ? data : []);
    
    return programs.map((program: ProgramSitemapItem) => ({
      id: program.id,
      updatedAt: program.updatedAt || program.createdAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('프로그램 목록 조회 오류:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const programs = await getAllPrograms();

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/programs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // 동적 페이지 (프로그램 상세)
  const programPages: MetadataRoute.Sitemap = programs.map((program) => ({
    url: `${SITE_URL}/programs/${program.id}`,
    lastModified: new Date(program.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...programPages];
}

