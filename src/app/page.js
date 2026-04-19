import Header from '@/components/Header/Header';
import Hero from '@/components/Hero/Hero';
import Capabilities from '@/components/Capabilities/Capabilities';
import Gallery from '@/components/Gallery/Gallery';
import Contacts from '@/components/Contacts/Contacts';
import RequestForm from '@/components/RequestForm/RequestForm';
import Footer from '@/components/Footer/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Capabilities />
        <Gallery />
        <Contacts />
        <RequestForm />
      </main>
      <Footer />
    </>
  );
}
