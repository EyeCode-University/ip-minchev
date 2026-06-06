'use client';

import { useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import styles from './GallerySlider.module.css';

const variants = {
  enter: (dir) => ({ x: dir >= 0 ? 64 : -64, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir >= 0 ? -64 : 64, opacity: 0 }),
};

export default function GallerySlider({ items, activeIndex, dir, onNavigate, onClose }) {
  const total = items.length;
  const item = items[activeIndex];
  const nextItem = items[(activeIndex + 1) % total];

  const go = useCallback(
    (delta) => onNavigate((activeIndex + delta + total) % total, delta),
    [activeIndex, total, onNavigate]
  );

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [go, onClose]);

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      role="dialog"
      aria-modal="true"
      aria-label="Галерея изделий"
    >
      <div className={styles.glow} aria-hidden="true" />

      <header className={styles.topbar}>
        <AnimatePresence mode="wait">
          <motion.h2
            key={activeIndex}
            className={styles.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {item.title}
          </motion.h2>
        </AnimatePresence>

        <button className={styles.close} onClick={onClose} aria-label="Закрыть">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </header>

      <div className={styles.stage}>
        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={activeIndex}
            className={styles.slide}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={(e, info) => {
              if (info.offset.x < -80) go(1);
              else if (info.offset.x > 80) go(-1);
            }}
          >
            <div className={styles.media}>
              {item.type === 'video' ? (
                <video
                  key={item.src}
                  className={styles.video}
                  src={item.src}
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={900}
                  height={1100}
                  className={styles.image}
                  sizes="(max-width: 860px) 78vw, 40vw"
                  priority
                  draggable={false}
                />
              )}
            </div>

            <div className={styles.info}>
              {item.specs?.length > 0 && (
                <div className={styles.specs}>
                  {item.specs.slice(0, 4).map((s, i) => (
                    <div key={i} className={styles.spec}>
                      <p className={styles.specValue}>
                        {s.value}
                        {s.unit && <span className={styles.specUnit}>{s.unit}</span>}
                      </p>
                      <p className={styles.specLabel}>{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {(item.description || item.subtitle) && (
                <p className={styles.desc}>{item.description || item.subtitle}</p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {nextItem && nextItem.type !== 'video' && (
          <button
            className={styles.peek}
            onClick={() => go(1)}
            aria-label="Следующее изделие"
            tabIndex={-1}
          >
            <Image
              src={nextItem.src}
              alt=""
              width={320}
              height={420}
              className={styles.peekImg}
              draggable={false}
            />
          </button>
        )}
      </div>

      <footer className={styles.bottombar}>
        <a href="#request" className={styles.cta} onClick={onClose}>
          Оставить заявку
          <span className={styles.ctaArrow}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </a>

        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={() => go(-1)} aria-label="Предыдущее изделие">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className={styles.counter}>
            {activeIndex + 1}
            <span className={styles.counterSep}>|</span>
            {total}
          </span>
          <button className={styles.navBtn} onClick={() => go(1)} aria-label="Следующее изделие">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </footer>
    </motion.div>
  );
}
