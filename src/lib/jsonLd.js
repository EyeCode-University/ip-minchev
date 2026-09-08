import { COMPANY, EQUIPMENT_LIST, GALLERY_IMAGES } from '@/lib/constants';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';

// ===== Микроразметка Schema.org (JSON-LD) =====
// Данные берутся из тех же констант, что и текст на странице: разметка,
// расходящаяся с видимым содержимым, считается недостоверной и вредит.

// Один общий @id, чтобы остальные сущности ссылались на организацию, а не
// дублировали её описание.
const ORG_ID = `${SITE_URL}/#organization`;

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORG_ID,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  telephone: COMPANY.phone,
  email: COMPANY.email,
  // PostalAddress намеренно не заявляем: физический адрес на публичных
  // страницах не показывается, а разметка, расходящаяся с видимым текстом,
  // считается недостоверной. Связь с местом даёт areaServed ниже.
  // Поставки по всей стране — это заявлено и на странице, и на карте в Hero.
  areaServed: { '@type': 'Country', name: 'Россия' },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: COMPANY.phone,
      email: COMPANY.email,
      availableLanguage: 'Russian',
      // Режим работы вешаем на контакт, а не на организацию: у Organization
      // нет openingHoursSpecification, это свойство Place/LocalBusiness.
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: COMPANY.workingHours.days,
        opens: COMPANY.workingHours.opens,
        closes: COMPANY.workingHours.closes,
      },
    },
  ],
  // Что именно изготавливаем — перечень с главной, без выдумок.
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Перечень продукции',
    itemListElement: EQUIPMENT_LIST.map((item, i) => ({
      '@type': 'Offer',
      position: i + 1,
      itemOffered: { '@type': 'Product', name: item },
    })),
  },
};

export const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: 'ru-RU',
  publisher: { '@id': ORG_ID },
};

// Изготовленные изделия из галереи. Даёт поисковику связку
// «изделие → изображение → изготовитель» по каждой позиции.
export const productsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Изготовленные изделия',
  numberOfItems: GALLERY_IMAGES.length,
  itemListElement: GALLERY_IMAGES.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Product',
      name: item.title,
      ...(item.subtitle ? { description: item.subtitle } : {}),
      // Имена файлов вида «slide-item (1).png» содержат пробелы: в разметке
      // адрес должен быть закодирован, иначе робот его не заберёт.
      image: encodeURI(`${SITE_URL}${item.src}`),
      manufacturer: { '@id': ORG_ID },
    },
  })),
};

// ===== Посадочные страницы =====

// Каждое направление — услуга, которую оказывает организация. Ссылка на неё
// идёт по @id, а не копией описания: так поисковик видит одну организацию,
// а не четыре разных.
export const landingJsonLd = (landing) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: landing.h1,
  serviceType: landing.navLabel,
  description: landing.metaDescription,
  url: `${SITE_URL}/${landing.slug}`,
  provider: { '@id': ORG_ID },
  areaServed: { '@type': 'Country', name: 'Россия' },
});

// Хлебные крошки: показывают поисковику место страницы в структуре сайта
// и подменяют голый URL в сниппете на понятный путь.
export const breadcrumbJsonLd = (landing) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE_URL}/` },
    {
      '@type': 'ListItem',
      position: 2,
      name: landing.navLabel,
      item: `${SITE_URL}/${landing.slug}`,
    },
  ],
});
