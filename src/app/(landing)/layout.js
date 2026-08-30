import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

// Посадочные страницы направлений: та же шапка и подвал, что на главной,
// без секций лендинга.
export default function LandingLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
