'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './FadeIn.module.css';

/*
  Обёртка «проявиться при попадании в вид».

  Реализована на IntersectionObserver + CSS-переходе, а не на motion: motion
  подставлял инлайновые стили на клиенте иначе, чем в серверном HTML, и секции
  приходилось выключать из SSR. Здесь дети всегда присутствуют в серверной
  разметке — это то, что индексирует поисковик, — а JS только переключает класс.

  Совместим по API с прежней motion-версией: delay, y, duration, className.
*/
export default function FadeIn({
  children,
  delay = 0,
  y = 30,
  duration = 0.7,
  className,
  ...props
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Древний браузер без IntersectionObserver: показываем на следующем кадре —
    // лучше, чем навсегда оставить контент прозрачным. Через кадр, а не сразу:
    // синхронный setState внутри эффекта даёт каскадный ререндер.
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          // Анимация одноразовая (прежний viewport.once), дальше наблюдать нечего.
          observer.disconnect();
        }
      },
      // Повторяет viewport.margin прежней версии: элемент считается видимым,
      // когда зашёл в область экрана на 80px.
      { rootMargin: '-80px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const classes = [styles.fadeIn, visible ? styles.visible : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={{
        '--fade-y': `${y}px`,
        '--fade-duration': `${duration}s`,
        '--fade-delay': `${delay}s`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
