import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer, Wait } from 'testcontainers';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    databaseUrl: string;
    mongoUrl: string;
  }
}

// Un postgres de usar y tirar con las mismas migraciones que produccion, y un
// mongo para el modelo de lectura. Sin la app y sin HTTP: los tests hablan
// directamente con los adaptadores.
export default async function setup(project: TestProject) {
  const pg = await new PostgreSqlContainer('postgres:17-alpine').start();
  const mongo = await new GenericContainer('mongo:8.0')
    .withExposedPorts(27017)
    .withWaitStrategy(Wait.forLogMessage(/Waiting for connections/))
    .start();
  const pool = new Pool({ connectionString: pg.getConnectionUri() });
  await migrate(drizzle(pool), { migrationsFolder: 'migrations' });
  await pool.end();

  project.provide('databaseUrl', pg.getConnectionUri());
  project.provide('mongoUrl', `mongodb://${mongo.getHost()}:${mongo.getMappedPort(27017)}/padel`);

  return async () => {
    await pg.stop();
    await mongo.stop();
  };
}
