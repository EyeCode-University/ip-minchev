import { Inter, IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import ContactFab from "@/components/ContactFab/ContactFab";
import ServiceWorkerCleanup from "@/components/ServiceWorkerCleanup";
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
  title: "gidromashprom — Производство промышленного оборудования",
  description:
    "Производство гидравлических цилиндров, арматуры высокого давления, запчастей к насосному оборудованию. Токарная, фрезерная обработка, ЧПУ. Поставки по всей России.",
  keywords:
    "производство, гидравлические цилиндры, арматура высокого давления, ЧПУ обработка, токарная обработка, фрезерование, промышленное оборудование",
  authors: [{ name: "gidromashprom" }],
  openGraph: {
    title: "gidromashprom — Производство промышленного оборудования",
    description:
      "Производство и поставка промышленного оборудования по России. Гидравлические цилиндры, арматура, ЧПУ обработка.",
    type: "website",
    locale: "ru_RU",
    siteName: "gidromashprom",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${inter.variable} ${plexMono.variable} ${playfair.variable}`}>
      <body>
        {children}
        <ContactFab />
        <ServiceWorkerCleanup />
      </body>
    </html>
  );
}
