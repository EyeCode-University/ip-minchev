'use client';

import { useState } from 'react';
import { EQUIPMENT_LIST, MACHINING_CAPABILITIES, MACHINE_FLEET } from '@/lib/constants';
import FadeIn from '@/components/FadeIn';
import styles from './Capabilities.module.css';

const PREVIEW_COUNT = 3;

export default function Capabilities() {
  const [expanded, setExpanded] = useState(false);
  const visibleCaps = expanded
    ? MACHINING_CAPABILITIES
    : MACHINING_CAPABILITIES.slice(0, PREVIEW_COUNT);

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
          {visibleCaps.map((cap, i) => {
            const num = String(i + 1).padStart(2, '0');
            return (
              <FadeIn key={i} delay={(i % PREVIEW_COUNT) * 0.06} className={styles.card}>
                <span className={styles.ghost} aria-hidden="true">{num}</span>
                <span className={styles.badge}>{num}</span>
                <h3 className={styles.cardTitle}>{cap.name}</h3>
                <div className={styles.params}>
                  <span>{cap.params}</span>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Станочный парк — раскрывается по «Подробнее» */}
        {expanded && (
          <FadeIn className={styles.block}>
            <div className={styles.blockHead}>
              <h3 className={styles.blockHeading}>Станочный парк</h3>
              <span className={styles.blockCount}>{MACHINE_FLEET.length} единиц</span>
            </div>
            <p className={styles.blockDesc}>
              Собственное оборудование для полного цикла механической обработки
            </p>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Тип станка</th>
                    <th>Модель</th>
                    <th className={styles.thSpec}>Рабочая зона</th>
                  </tr>
                </thead>
                <tbody>
                  {MACHINE_FLEET.map((m, i) => {
                    const firstOfType = i === 0 || MACHINE_FLEET[i - 1].type !== m.type;
                    return (
                      <tr key={i} className={firstOfType ? styles.rowGroup : undefined}>
                        <td className={styles.tdType}>{firstOfType ? m.type : ''}</td>
                        <td className={styles.tdModel}>{m.model}</td>
                        <td className={styles.tdSpec}>{m.spec}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FadeIn>
        )}

        {/* Кнопка раскрытия */}
        <div className={styles.moreWrap}>
          <button
            type="button"
            className={`${styles.moreBtn} ${expanded ? styles.moreBtnOpen : ''}`}
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? 'Свернуть' : 'Подробнее'}
            <svg className={styles.moreIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Перечень продукции */}
        <FadeIn delay={0.1} className={styles.block}>
          <h3 className={styles.blockHeading}>Перечень продукции</h3>
          <p className={styles.blockDesc}>
            Оборудование и запасные части, изготавливаемые нашей компанией
          </p>
          <div className={styles.productList}>
            {EQUIPMENT_LIST.map((item, i) => (
              <div key={i} className={styles.productItem}>
                <span className={styles.productDot} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
