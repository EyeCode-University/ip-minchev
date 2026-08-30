/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Самодостаточная сборка для Docker: Next кладёт в .next/standalone минимальный
  // сервер вместе с нужными node_modules — образ не тащит весь dev-зоопарк.
  output: 'standalone',
  reactCompiler: true,

  images: {
    // Галерея — 43 МБ исходных PNG. AVIF даёт кратно меньший вес при том же
    // качестве, WebP остаётся запасным для браузеров без поддержки AVIF.
    formats: ['image/avif', 'image/webp'],
    // Оптимизированные варианты пересобираются дорого, а исходники не меняются:
    // держим их в кеше год вместо дефолтных 60 секунд.
    minimumCacheTTL: 31536000,
  },

  async headers() {
    return [
      {
        // Файлы из public/ Next отдаёт без заголовков кеширования, из-за чего
        // видео и неоптимизированные ассеты качаются заново при каждом визите.
        // Имена файлов не хешируются, поэтому не immutable — сутки в браузере
        // и неделя в режиме «отдать старое и обновить фоном».
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  experimental: {
    // Форма заявки допускает файлы до 10 МБ. Дефолтный лимит тела Server Action — 1 МБ,
    // из-за чего заявки с файлом > 1 МБ отклонялись фреймворком и письмо не отправлялось.
    // Запас сверх 10 МБ — на overhead multipart/base64.
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
};

export default nextConfig;
