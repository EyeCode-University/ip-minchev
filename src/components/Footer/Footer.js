import Link from 'next/link';
import { COMPANY } from '@/lib/constants';
import { LEGAL_NAME } from '@/lib/site';
import { LANDING_LIST } from '@/lib/landings';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.top}>
          {/* NAP: наименование, адрес, телефон. Тот же набор данных уходит
              в микроразметку и должен совпадать с карточкой организации
              в справочниках — расхождения снижают доверие к сайту. */}
          <div className={styles.info}>
            <span className={styles.name}>{COMPANY.name}</span>
            <span className={styles.legalName}>{LEGAL_NAME}</span>
            <address className={styles.address}>{COMPANY.address.full}</address>
            <span className={styles.hours}>{COMPANY.workingHours.label}</span>
          </div>
          <div className={styles.contacts}>
            <a href={COMPANY.phoneHref} className={styles.link}>
              {COMPANY.phone}
            </a>
            <a href={COMPANY.emailHref} className={styles.link}>
              {COMPANY.email}
            </a>
          </div>
        </div>
        {/* Ссылки на страницы направлений со всех страниц сайта. */}
        <nav className={styles.directions} aria-label="Направления">
          {LANDING_LIST.map((landing) => (
            <Link key={landing.slug} href={`/${landing.slug}`} className={styles.link}>
              {landing.navLabel}
            </Link>
          ))}
        </nav>

        <div className={styles.legal}>
          <Link href="/privacy" className={styles.link}>
            Политика конфиденциальности
          </Link>
          <Link href="/consent" className={styles.link}>
            Согласие на обработку ПДн
          </Link>
        </div>
        <div className={styles.bottom}>
          <span>&copy; {year} {COMPANY.name} Все права защищены.</span>
        </div>
      </div>
    </footer>
  );
}
