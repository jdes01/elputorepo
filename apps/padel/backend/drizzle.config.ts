import { defineConfig } from 'drizzle-kit';
import { loadConfig } from './src/config';

// `url` es un GETTER: `generate` compara schema y snapshot sin tocar la BD, y con
// un valor pediria una DATABASE_URL que no usa.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './migrations',
  dbCredentials: {
    get url(): string {
      return loadConfig().databaseUrl;
    },
  },
  strict: true,
  verbose: true,
});
