import { SITE_URL } from '@/lib/site';

// robots.txt. Правовые страницы намеренно НЕ закрыты от обхода: у них стоит
// meta robots noindex, а чтобы робот её увидел, страницу нужно дать скачать.
// Disallow здесь помешал бы этому и оставил страницы в индексе «вслепую».
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
