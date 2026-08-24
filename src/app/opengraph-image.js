import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/site';

// Превью ссылки в Telegram / WhatsApp / почте. В B2B ссылку пересылают
// снабженцу или главному механику — без картинки сообщение выглядит спамом.
//
// Картинка генерируется кодом, а не лежит файлом: правится в git вместе
// с текстом оффера и не требует дизайнера. Собирается один раз на этапе
// сборки (статическая оптимизация), в рантайме отдаётся из кеша.
//
// Шрифт не подключаем: встроенный в next/og Geist покрывает кириллицу
// (проверено по cmap), поэтому лишний ttf в образ не тащим.

export const alt = 'gidromashprom — производство промышленного оборудования';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const ACCENT = '#2b5cff';

// Satori не наследует display от браузерных дефолтов: любой div с несколькими
// детьми обязан иметь display: 'flex' явно, иначе сборка падает.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          backgroundColor: '#0b0d12',
          backgroundImage:
            'radial-gradient(circle at 78% 18%, rgba(43,92,255,0.35) 0%, rgba(11,13,18,0) 55%)',
          color: '#ffffff',
        }}
      >
        {/* Шапка: логотип-марка + бренд */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: ACCENT,
              fontSize: 36,
              letterSpacing: -1,
            }}
          >
            M
          </div>
          <div style={{ fontSize: 34, letterSpacing: 0.5 }}>{SITE_NAME}</div>
        </div>

        {/* Оффер */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: 60,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              maxWidth: 1040,
            }}
          >
            <div style={{ display: 'flex' }}>Производство промышленного</div>
            <div style={{ display: 'flex', color: '#8fa9ff' }}>оборудования на заказ</div>
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#9aa3b2', maxWidth: 1040 }}>
            Гидроцилиндры Ø50–800 · Арматура Ру250 · Механообработка и ЧПУ
          </div>
        </div>

        {/* Подвал: география и телефон */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 32,
            borderTop: '1px solid rgba(255,255,255,0.14)',
            fontSize: 26,
            color: '#c7cdd8',
          }}
        >
          <div style={{ display: 'flex' }}>Поставки по всей России</div>
          <div style={{ display: 'flex' }}>+7 949 714 46 22</div>
        </div>
      </div>
    ),
    size
  );
}
