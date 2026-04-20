'use client';

import { useEffect, useState } from 'react';
import { COMPANY } from '@/lib/constants';
import styles from './ContactFab.module.css';

export default function ContactFab() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.fab}
        onClick={() => setOpen(true)}
        aria-label="Быстрая связь"
        aria-expanded={open}
      >
        <span className={styles.fabRing} aria-hidden="true" />
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      </button>

      {open && (
        <div
          className={styles.backdrop}
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className={styles.card}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-fab-title"
          >
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className={styles.header}>
              <h3 id="contact-fab-title" className={styles.title}>
                Свяжитесь удобным способом
              </h3>
              <p className={styles.subtitle}>Отвечаем в течение рабочего дня</p>
            </div>

            <div className={styles.actions}>
              <a href={COMPANY.phoneHref} className={`${styles.action} ${styles.actionCall}`}>
                <span className={styles.actionIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </span>
                <span className={styles.actionText}>
                  <span className={styles.actionLabel}>Позвонить</span>
                  <span className={styles.actionValue}>{COMPANY.phone}</span>
                </span>
                <svg className={styles.actionArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </a>

              <a
                href={COMPANY.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.action} ${styles.actionWhatsapp}`}
              >
                <span className={styles.actionIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.47 14.38c-.3-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.08a8.26 8.26 0 01-2.44-1.5 9.1 9.1 0 01-1.69-2.1c-.18-.3 0-.47.13-.62.14-.14.3-.37.44-.55.15-.18.2-.31.3-.52.1-.2.05-.38-.03-.53-.08-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.51l-.56-.01c-.2 0-.52.08-.79.38-.27.3-1.03 1-1.03 2.44 0 1.44 1.05 2.84 1.2 3.04.14.2 2.07 3.17 5.03 4.44.7.3 1.25.48 1.68.62.7.22 1.35.19 1.86.12.57-.09 1.74-.71 1.98-1.4.25-.68.25-1.27.17-1.39-.07-.13-.27-.2-.57-.35zM12 2C6.48 2 2 6.48 2 12c0 1.87.52 3.6 1.42 5.1L2 22l4.98-1.42A9.95 9.95 0 0012 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                  </svg>
                </span>
                <span className={styles.actionText}>
                  <span className={styles.actionLabel}>WhatsApp</span>
                  <span className={styles.actionValue}>Написать в чат</span>
                </span>
                <svg className={styles.actionArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </a>

              <a
                href={COMPANY.telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.action} ${styles.actionTelegram}`}
              >
                <span className={styles.actionIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M9.78 15.57l-.38 4.56c.54 0 .78-.23 1.06-.5l2.54-2.43 5.27 3.86c.97.53 1.65.25 1.9-.9l3.45-16.16c.3-1.4-.51-1.95-1.45-1.6L1.37 9.2c-1.37.53-1.35 1.3-.23 1.64l5.1 1.6 11.84-7.46c.56-.37 1.07-.17.65.22L9.78 15.57z" />
                  </svg>
                </span>
                <span className={styles.actionText}>
                  <span className={styles.actionLabel}>Telegram</span>
                  <span className={styles.actionValue}>Написать в чат</span>
                </span>
                <svg className={styles.actionArrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
