// Подключаем матчеры jest-dom (toBeInTheDocument и т.п.) только если есть
// DOM-окружение — в node-тестах document отсутствует.
if (typeof document !== 'undefined') {
  await import('@testing-library/jest-dom/vitest');
}

// jsdom не реализует IntersectionObserver, а motion (FadeIn / whileInView) его
// требует при монтировании. Минимальная заглушка: считаем элемент видимым сразу.
if (typeof window !== 'undefined' && !('IntersectionObserver' in window)) {
  class IntersectionObserverStub {
    constructor(callback) {
      this.callback = callback;
    }
    observe(target) {
      this.callback([{ target, isIntersecting: true, intersectionRatio: 1 }], this);
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.IntersectionObserver = IntersectionObserverStub;
  globalThis.IntersectionObserver = IntersectionObserverStub;
}
