import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    databaseUrl: string;
  }
}

// Un postgres de usar y tirar con las mismas migraciones que produccion. Sin la
// app y sin HTTP: los tests hablan directamente con los repositorios.
export default async function setup(project: TestProject) {
  const pg = await new PostgreSqlContainer('postgres:17-alpine').start();
  const pool = new Pool({ connectionString: pg.getConnectionUri() });
  await migrate(drizzle(pool), { migrationsFolder: 'migrations' });
  await pool.end();

  project.provide('databaseUrl', pg.getConnectionUri());

  return async () => {
    await pg.stop();
  };
}
