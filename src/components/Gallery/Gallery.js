'use client';

import { useState } from 'react';
import Image from 'next/image';
import { GALLERY_IMAGES } from '@/lib/constants';
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
          {GALLERY_IMAGES.map((img, i) => (
            <FadeIn key={i} delay={i * 0.04} className={styles.thumbWrap}>
              <button
                className={styles.thumb}
                onClick={() => setActiveIndex(i)}
                aria-label={`Открыть фото ${i + 1}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={400}
                  height={300}
                  className={styles.image}
                  sizes="(max-width: 480px) 100vw, (max-width: 734px) 50vw, 33vw"
                />
                <div className={styles.overlay}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>

      {activeIndex !== null && (
        <Lightbox
          images={GALLERY_IMAGES}
          activeIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          onPrev={() =>
            setActiveIndex((i) => (i - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length)
          }
          onNext={() =>
            setActiveIndex((i) => (i + 1) % GALLERY_IMAGES.length)
          }
        />
      )}
    </section>
  );
}
