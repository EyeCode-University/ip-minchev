import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import Capabilities from '@/components/Capabilities/Capabilities';
import CitiesMarquee from '@/components/CitiesMarquee/CitiesMarquee';
import Gallery from '@/components/Gallery/Gallery';
import Contacts from '@/components/Contacts/Contacts';
import RequestForm from '@/components/RequestForm/RequestForm';
import Footer from '@/components/Footer/Footer';
import JsonLd from '@/components/JsonLd';
import { productsJsonLd } from '@/lib/jsonLd';

export default function Home() {
  return (
    <>
      {/* Перечень изготовленных изделий — контент именно главной страницы. */}
      <JsonLd data={productsJsonLd} />
      <Header />
      <main>
        <Hero />
        <Capabilities />
        <CitiesMarquee />
        <Gallery />
        <Contacts />
        <RequestForm />
      </main>
      <Footer />
    </>
  );
}
