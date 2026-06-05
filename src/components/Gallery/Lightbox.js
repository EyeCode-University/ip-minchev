'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import styles from './Lightbox.module.css';

export default function Lightbox({ images, activeIndex, onClose, onPrev, onNext }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose, onPrev, onNext]);

  const img = images[activeIndex];

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick} role="dialog" aria-label="Просмотр фото">
      <div className={styles.content}>
        {img.type === 'video' ? (
          <video
            key={img.src}
            className={styles.video}
            src={img.src}
            controls
            autoPlay
            playsInline
          />
        ) : (
          <Image
            src={img.src}
            alt={img.alt}
            width={1200}
            height={900}
            className={styles.image}
            sizes="90vw"
            priority
          />
        )}

        {img.type !== 'video' && (
          <div className={styles.caption}>
            <p className={styles.captionTitle}>{img.title}</p>
            {img.subtitle && <p className={styles.captionSubtitle}>{img.subtitle}</p>}
          </div>
        )}

        <span className={styles.counter}>
          {activeIndex + 1} / {images.length}
        </span>
      </div>

      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={onPrev} aria-label="Предыдущее фото">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={onNext} aria-label="Следующее фото">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <button className={styles.close} onClick={onClose} aria-label="Закрыть">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}
