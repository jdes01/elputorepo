import { defineConfig } from 'vitest/config';

// Integracion: los adaptadores contra infraestructura real (postgres en docker).
export default defineConfig({
  test: {
    setupFiles: ['vitest.silence-logs.ts'],
    include: ['src/**/*.integration.test.ts'],
    globalSetup: ['integration/global-setup.ts'],
    hookTimeout: 60_000,
  },
});
