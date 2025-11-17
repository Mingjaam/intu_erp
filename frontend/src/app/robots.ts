import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nuvio.kr';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/auth',
          '/applications',
          '/dashboard',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

