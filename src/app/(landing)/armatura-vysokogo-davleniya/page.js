import LandingPage from '@/components/Landing/LandingPage';
import JsonLd from '@/components/JsonLd';
import { getLanding } from '@/lib/landings';
import { landingJsonLd, breadcrumbJsonLd } from '@/lib/jsonLd';

const SLUG = 'armatura-vysokogo-davleniya';
const data = getLanding(SLUG);

export const metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  alternates: { canonical: `/${SLUG}` },
  openGraph: {
    title: data.metaTitle,
    description: data.metaDescription,
    url: `/${SLUG}`,
    type: 'website',
  },
};

export default function Page() {
  return (
    <>
      <JsonLd data={landingJsonLd(data)} />
      <JsonLd data={breadcrumbJsonLd(data)} />
      <LandingPage data={data} />
    </>
  );
}
