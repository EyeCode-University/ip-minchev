'use client';

import { COMPANY } from '@/lib/constants';
import FadeIn from '@/components/FadeIn';
import styles from './Contacts.module.css';

export default function Contacts() {
  return (
    <section id="contacts" className={styles.section}>
      <div className="container">
        <FadeIn>
          <p className={styles.eyebrow}>Контакты</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className={styles.heading}>Свяжитесь с нами</h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className={styles.subheading}>
            Для расчёта стоимости и консультации
          </p>
        </FadeIn>

        <div className={styles.grid}>
          <FadeIn delay={0.15} className={styles.card}>
            <a href={COMPANY.phoneHref} className={styles.cardInner}>
              <div className={styles.icon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <span className={styles.cardLabel}>Телефон</span>
              <span className={styles.cardValue}>{COMPANY.phone}</span>
            </a>
          </FadeIn>

          <FadeIn delay={0.25} className={styles.card}>
            <a href={COMPANY.emailHref} className={styles.cardInner}>
              <div className={styles.icon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
                </svg>
              </div>
              <span className={styles.cardLabel}>Email</span>
              <span className={styles.cardValue}>{COMPANY.email}</span>
            </a>
          </FadeIn>

          <FadeIn delay={0.35} className={styles.card}>
            <div className={styles.cardInner}>
              <div className={styles.icon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span className={styles.cardLabel}>Адрес</span>
              <address className={styles.cardValue}>{COMPANY.address}</address>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
