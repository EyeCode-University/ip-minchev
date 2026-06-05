/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Самодостаточная сборка для Docker: Next кладёт в .next/standalone минимальный
  // сервер вместе с нужными node_modules — образ не тащит весь dev-зоопарк.
  output: 'standalone',
  reactCompiler: true,
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
