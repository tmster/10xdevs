/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@astrojs/react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/tests/**'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.astro', 'e2e', 'playwright.config.ts'],
    testTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': './src',
    },
  },
});