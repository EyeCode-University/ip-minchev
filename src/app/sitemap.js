import { SITE_URL } from '@/lib/site';
import { LANDING_LIST } from '@/lib/landings';

// Правовые страницы в карту не попадают: они под noindex.
export default function sitemap() {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 1,
    },
    ...LANDING_LIST.map((landing) => ({
      url: `${SITE_URL}/${landing.slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    })),
  ];
}
