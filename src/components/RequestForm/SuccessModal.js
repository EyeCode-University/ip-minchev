'use client';

import { useEffect } from 'react';
import styles from './SuccessModal.module.css';

export default function SuccessModal({ onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-label="Заявка отправлена">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className={styles.title}>Заявка отправлена!</h3>
        <p className={styles.text}>
          Обработка заявок и расчёт стоимости выполняется в течение 24 часов.
          Мы свяжемся с вами в ближайшее время.
        </p>
        <button className={styles.button} onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
}
