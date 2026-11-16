import swc from 'unplugin-swc';
import { defineConfig, type Plugin } from 'vitest/config';

// Tests de los controllers: la app de Nest entera, con adaptadores en memoria.
// El transform por defecto de vitest no emite los metadatos de los decoradores, y
// sin ellos el inyector de Nest no sabe que pedir: se compila con SWC, igual que
// el build. El cast salva un choque de tipos entre versiones de vite; en runtime
// el plugin es el mismo.
const swcPlugin = swc.vite({
  // El .swcrc es el del build, que deja fuera los tests.
  swcrc: false,
  jsc: {
    parser: { syntax: 'typescript', decorators: true },
    transform: { legacyDecorator: true, decoratorMetadata: true, useDefineForClassFields: false },
    target: 'es2022',
    keepClassNames: true,
  },
  module: { type: 'es6' },
}) as unknown as Plugin;

export default defineConfig({
  plugins: [swcPlugin],
  test: {
    include: ['http/**/*.http.test.ts'],
  },
});
