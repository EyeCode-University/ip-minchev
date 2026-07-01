'use client';

import { COMPANY } from '@/lib/constants';
import FadeIn from '@/components/FadeIn';
import styles from './Contacts.module.css';

export default function Contacts() {
  return (
    <section id="contacts" className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <FadeIn className={styles.statement}>
            <h2 className={styles.heading}>
              Свяжитесь<br />с нами
            </h2>
            <p className={styles.subheading}>
              Для расчёта стоимости и консультации по вашему проекту.
            </p>
            <div className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span className={styles.statusText}>Отвечаем в течение рабочего дня</span>
            </div>
          </FadeIn>

          <div className={styles.list}>
            <FadeIn delay={0.1}>
              <a href={COMPANY.phoneHref} className={`${styles.row} ${styles.rowLink}`}>
                <span className={styles.rowLabel}>Телефон</span>
                <span className={styles.rowValue}>{COMPANY.phone}</span>
                <svg className={styles.rowArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17L17 7M17 7H9M17 7v8" />
                </svg>
              </a>
            </FadeIn>

            <FadeIn delay={0.2}>
              <a href={COMPANY.emailHref} className={`${styles.row} ${styles.rowLink}`}>
                <span className={styles.rowLabel}>Email</span>
                <span className={styles.rowValue}>{COMPANY.email}</span>
                <svg className={styles.rowArrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17L17 7M17 7H9M17 7v8" />
                </svg>
              </a>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
