'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import RussiaMap from './RussiaMap';
import styles from './Hero.module.css';

// Фоновая 3D-модель на WebGL — самая тяжёлая часть первого экрана: сборка сцены
// и компиляция шейдеров занимают главный поток ровно тогда, когда браузер
// должен отрисовать заголовок. Выносим её в отдельный чанк и монтируем уже
// после первой отрисовки — на LCP она больше не влияет.
const ReactorModel = dynamic(() => import('./ReactorModel'), { ssr: false });


export default function Hero() {
  const [showReactor, setShowReactor] = useState(false);

  useEffect(() => {
    // Ждём, пока браузер освободится: сначала первый экран, потом декорация.
    if (typeof requestIdleCallback === 'function') {
      const id = requestIdleCallback(() => setShowReactor(true), { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }

    // Safari до 18-й версии не знает requestIdleCallback.
    const timer = setTimeout(() => setShowReactor(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.reactorWrap}>{showReactor && <ReactorModel />}</div>

      <div className={`container ${styles.content}`}>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Производство промышленного{' '}
          <span className={styles.accent}>оборудования</span>
        </motion.h1>
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Изготовление индивидуальной продукции для крупных заводов
          и атомных станций. Поставки по всей России.
        </motion.p>
        <motion.div
          className={styles.ctas}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a href="#request" className={styles.ctaPrimary}>
            Оставить заявку
          </a>
          <a href="#capabilities" className={styles.ctaLink}>
            Наши возможности
            <span className={styles.arrow}>›</span>
          </a>
        </motion.div>
      </div>

      <motion.div
        className={styles.mapWrap}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <RussiaMap />
        <p className={styles.mapCaption}>
          География поставок и партнёрского производства по России
        </p>
      </motion.div>
    </section>
  );
}
