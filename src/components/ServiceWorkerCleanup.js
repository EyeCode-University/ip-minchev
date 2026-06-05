'use client';

import { useEffect } from 'react';

// В проекте нет собственного service worker. Но на домене (в т.ч. localhost:3000)
// мог остаться «осиротевший» SW от прежнего проекта — он перехватывает запросы и
// падает на кэшировании 206-ответов (range-запросы видео):
//   TypeError: Failed to execute 'put' on 'Cache': Partial response (206) is unsupported
// Снимаем регистрацию всех SW и вычищаем их кэши — один раз при загрузке.
export default function ServiceWorkerCleanup() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistrations?.()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});

    if ('caches' in window) {
      caches.keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .catch(() => {});
    }
  }, []);

  return null;
}
