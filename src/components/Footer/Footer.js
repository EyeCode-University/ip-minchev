import Link from 'next/link';
import { COMPANY } from '@/lib/constants';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.top}>
          <div className={styles.info}>
            <span className={styles.name}>{COMPANY.name}</span>
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
