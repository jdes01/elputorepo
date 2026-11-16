import { defineConfig } from 'vitest/config';

// Integracion: los adaptadores contra infraestructura real (postgres en docker).
export default defineConfig({
  test: {
    include: ['src/**/*.integration.test.ts'],
    globalSetup: ['integration/global-setup.ts'],
    hookTimeout: 60_000,
  },
});
