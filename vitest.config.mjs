import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Компоненты лежат в .js с JSX — расширяем охват трансформера на .js.
  plugins: [react({ include: /\.[jt]sx?$/ })],
  // esbuild парсит .js как обычный JS на этапе import-analysis — велим
  // грузить исходники проекта как JSX.
  esbuild: { loader: 'jsx', include: /\.[jt]sx?$/, exclude: /node_modules/ },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    // По умолчанию Node (логика). Файлы с React помечают себя
    // `// @vitest-environment jsdom` в шапке.
    environment: 'node',
    setupFiles: ['./vitest.setup.mjs'],
    include: ['tests/**/*.test.{js,jsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/app/actions.js', 'src/lib/sendEmail.js', 'src/lib/sendTelegram.js'],
      reporter: ['text', 'html'],
    },
  },
});
