'use client';

import { motion } from 'motion/react';
import RussiaMap from './RussiaMap';
import ReactorModel from './ReactorModel';
import styles from './Hero.module.css';


export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.reactorWrap}>
        <ReactorModel />
      </div>

      <div className={`container ${styles.content}`}>
        <motion.p
          className={styles.eyebrow}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Торговый представитель Минчева Э.Р.
        </motion.p>
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
