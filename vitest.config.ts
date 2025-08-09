import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      'tests/unit/**/*.{test,spec}.{js,ts}',
      'tests/api/**/*.{test,spec}.{js,ts}',
      'tests/audit/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'tests/e2e/**/*.{test,spec}.{js,ts}'
    ],
    environment: 'jsdom'
  }
}); 