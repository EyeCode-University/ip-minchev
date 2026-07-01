// Подключаем матчеры jest-dom (toBeInTheDocument и т.п.) только если есть
// DOM-окружение — в node-тестах document отсутствует.
if (typeof document !== 'undefined') {
  await import('@testing-library/jest-dom/vitest');
}
