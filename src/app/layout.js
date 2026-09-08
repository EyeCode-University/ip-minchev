import { Inter, IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import ContactFab from "@/components/ContactFab/ContactFab";
import CookieNotice from "@/components/CookieNotice/CookieNotice";
import ServiceWorkerCleanup from "@/components/ServiceWorkerCleanup";
import JsonLd from "@/components/JsonLd";
import { organizationJsonLd, webSiteJsonLd } from "@/lib/jsonLd";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
} from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-sf",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

// Чертёжный блок «Создать заявку»: моноширинный для тех-меток, serif для заголовка.
const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata = {
  // Без metadataBase Next не может развернуть относительные пути в абсолютные
  // URL — canonical и og:image просто не попадают в разметку.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    // Дочерние страницы задают только свою часть: «Политика конфиденциальности»
    // → «Политика конфиденциальности — gidromashprom».
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  // Канонический адрес: страховка от дублей вида ?utm_source=..., /index,
  // http/https и www/без-www, которые иначе размывают вес страницы.
  alternates: { canonical: "/" },
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // meta keywords не учитывается ни Google (с 2009), ни Яндексом — не задаём.
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Разрешаем крупное превью изображения и сниппет без обрезки —
      // иначе Google по умолчанию режет и то, и другое.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Телефон в контактах — ссылка tel:, автолинковка Safari только ломает вёрстку.
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${inter.variable} ${plexMono.variable} ${playfair.variable}`}>
      <body>
        {/* Организация и сайт описываются одинаково на всех страницах. */}
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={webSiteJsonLd} />
        {children}
        <ContactFab />
        <CookieNotice />
        <ServiceWorkerCleanup />
      </body>
    </html>
  );
}
