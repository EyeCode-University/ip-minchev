'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GALLERY_MEDIA } from '@/lib/constants';
import FadeIn from '@/components/FadeIn';
import Lightbox from './Lightbox';
import styles from './Gallery.module.css';

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <section id="gallery" className={styles.section}>
      <div className="containerWide">
        <FadeIn>
          <p className={styles.eyebrow}>Галерея</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className={styles.heading}>Наша продукция</h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className={styles.subheading}>
            Примеры изготовленных изделий для промышленных предприятий
          </p>
        </FadeIn>

        <div className={styles.grid}>
          {GALLERY_MEDIA.map((item, i) => (
            <FadeIn key={i} delay={i * 0.04} className={styles.thumbWrap}>
              <button
                className={styles.card}
                onClick={() => setActiveIndex(i)}
                aria-label={
                  item.type === 'video'
                    ? `Открыть видео: ${item.title}`
                    : `Открыть фото: ${item.alt}`
                }
              >
                <span className={styles.thumb}>
                  {item.type === 'video' ? (
                    <>
                      <video
                        className={styles.thumbVideo}
                        src={item.src}
                        muted
                        playsInline
                        preload="metadata"
                      />
                      <span className={styles.playBadge}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </>
                  ) : (
                    <>
                      <Image
                        src={item.src}
                        alt={item.alt}
                        width={400}
                        height={300}
                        className={styles.image}
                        sizes="(max-width: 480px) 100vw, (max-width: 734px) 50vw, 33vw"
                      />
                      <span className={styles.overlay}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" />
                          <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          <line x1="11" y1="8" x2="11" y2="14" />
                          <line x1="8" y1="11" x2="14" y2="11" />
                        </svg>
                      </span>
                    </>
                  )}
                </span>
                <span className={styles.caption}>
                  <span className={styles.captionTitle}>{item.title}</span>
                  {item.subtitle && <span className={styles.captionSubtitle}>{item.subtitle}</span>}
                </span>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <Lightbox
          images={GALLERY_MEDIA}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onPrev={() =>
            setActiveIndex((i) => (i - 1 + GALLERY_MEDIA.length) % GALLERY_MEDIA.length)
          }
          onNext={() =>
            setActiveIndex((i) => (i + 1) % GALLERY_MEDIA.length)
          }
        />
      )}
    </section>
  );
}
