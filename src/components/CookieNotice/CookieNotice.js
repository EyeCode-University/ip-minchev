'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './CookieNotice.module.css';

// Ключ с версией: если текст уведомления изменится по существу, достаточно
// поднять версию — и плашка покажется снова тем, кто её уже закрывал.
const STORAGE_KEY = 'gmp-data-notice-v1';

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // На сервере localStorage нет, поэтому первый рендер всегда пустой —
    // решение показывать плашку принимается уже в браузере.
    let accepted = false;
    try {
      accepted = Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      // Приватный режим или запрет на хранилище: показываем плашку каждый раз,
      // это честнее, чем не показать вовсе.
      accepted = false;
    }
    if (accepted) return;

    // Через кадр, а не сразу: синхронный setState внутри эффекта даёт
    // каскадный ререндер, да и плашке незачем моргать во время гидратации.
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const accept = () => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Не сохранилось — не страшно, вернётся при следующем визите.
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.notice} role="region" aria-label="Уведомление об обработке данных">
      <p className={styles.text}>
        Мы обрабатываем данные посетителей сайта и используем cookie, чтобы
        сайт работал корректно. Подробнее — в{' '}
        <Link href="/privacy" className={styles.link}>
          Политике конфиденциальности
        </Link>
        .
      </p>
      <button type="button" className={styles.button} onClick={accept}>
        Понятно
      </button>
    </div>
  );
}
