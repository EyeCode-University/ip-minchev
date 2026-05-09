import { Inter } from "next/font/google";
import ContactFab from "@/components/ContactFab/ContactFab";
import "./globals.css";

const inter = Inter({
  variable: "--font-sf",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata = {
  title: "Торговый представитель Минчева Э.Р. — Производство промышленного оборудования",
  description:
    "Производство гидравлических цилиндров, арматуры высокого давления, запчастей к насосному оборудованию. Токарная, фрезерная обработка, ЧПУ. Поставки по всей России.",
  keywords:
    "производство, гидравлические цилиндры, арматура высокого давления, ЧПУ обработка, токарная обработка, фрезерование, промышленное оборудование",
  authors: [{ name: "Торговый представитель Минчева Э.Р." }],
  openGraph: {
    title: "Торговый представитель Минчева Э.Р. — Производство промышленного оборудования",
    description:
      "Производство и поставка промышленного оборудования по России. Гидравлические цилиндры, арматура, ЧПУ обработка.",
    type: "website",
    locale: "ru_RU",
    siteName: "Торговый представитель Минчева Э.Р.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body>
        {children}
        <ContactFab />
      </body>
    </html>
  );
}
