'use client';

import { EQUIPMENT_LIST, MACHINING_CAPABILITIES } from '@/lib/constants';
import FadeIn from '@/components/FadeIn';
import styles from './Capabilities.module.css';

export default function Capabilities() {
  return (
    <section id="capabilities" className={styles.section}>
      <div className="container">
        <FadeIn>
          <p className={styles.eyebrow}>Возможности</p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <h2 className={styles.heading}>
            Технологические
            <br />
            возможности
          </h2>
        </FadeIn>
        <FadeIn delay={0.2}>
          <p className={styles.subheading}>
            Полный цикл производства — от заготовки до готового изделия.
            Современное оборудование с числовым программным управлением.
          </p>
        </FadeIn>

        {/* Machining capabilities — featured cards */}
        <div className={styles.grid}>
          {MACHINING_CAPABILITIES.map((cap, i) => (
            <FadeIn key={i} delay={i * 0.06} className={styles.card}>
              <div className={styles.cardIcon}>
                <span className={styles.cardNumber}>{String(i + 1).padStart(2, '0')}</span>
                <h3 className={styles.cardTitle}>{cap.name}</h3>
              </div>
              
              <p className={styles.cardParams}>{cap.params}</p>
            </FadeIn>
          ))}
        </div>

        {/* Equipment list */}
        <FadeIn delay={0.15}>
          <div className={styles.equipmentBlock}>
            <h3 className={styles.equipmentHeading}>Перечень продукции</h3>
            <p className={styles.equipmentDesc}>
              Оборудование и запасные части, изготавливаемые нашей компанией
            </p>
            <div className={styles.equipmentList}>
              {EQUIPMENT_LIST.map((item, i) => (
                <FadeIn key={i} delay={i * 0.04} className={styles.equipmentItem}>
                  <span className={styles.equipmentDot} />
                  <span>{item}</span>
                </FadeIn>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
