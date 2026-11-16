import { defineConfig } from 'vitest/config';

// Unitarios: sin BD, sin red, sin docker. Viven junto al codigo que prueban.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', 'src/**/*.integration.test.ts'],
  },
});
