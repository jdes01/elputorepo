import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['e2e/**/*.e2e.test.ts'],
    globalSetup: ['e2e/global-setup.ts'],
    // El contenedor y el arranque de la app viven en globalSetup.
    hookTimeout: 60_000,
  },
});
