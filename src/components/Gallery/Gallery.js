'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'motion/react';
import { GALLERY_MEDIA } from '@/lib/constants';
import FadeIn from '@/components/FadeIn';
import GallerySlider from './GallerySlider';
import styles from './Gallery.module.css';

const PREVIEW_COUNT = 4;

export default function Gallery() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [dir, setDir] = useState(0);

  const open = (index) => {
    setDir(0);
    setActiveIndex(index);
  };

  const navigate = (index, delta) => {
    setDir(delta);
    setActiveIndex(index);
  };

  const preview = GALLERY_MEDIA.slice(0, PREVIEW_COUNT);

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
          {preview.map((item, i) => (
            <FadeIn key={i} delay={i * 0.04} className={styles.thumbWrap}>
              <button
                className={styles.card}
                onClick={() => open(i)}
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

        <FadeIn delay={0.1}>
          <div className={styles.more}>
            <button className={styles.moreBtn} onClick={() => open(0)}>
              Смотреть все изделия
              <span className={styles.moreCount}>{GALLERY_MEDIA.length}</span>
            </button>
          </div>
        </FadeIn>
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <GallerySlider
            items={GALLERY_MEDIA}
            activeIndex={activeIndex}
            dir={dir}
            onNavigate={navigate}
            onClose={() => setActiveIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
