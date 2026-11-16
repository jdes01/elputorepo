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
    redisUrl: string;
  }
}

// Un postgres de usar y tirar con las mismas migraciones que produccion, un
// mongo para el modelo de lectura y un redis para la cache. Sin la app y sin HTTP: los tests hablan
// directamente con los adaptadores.
export default async function setup(project: TestProject) {
  const pg = await new PostgreSqlContainer('postgres:17-alpine').start();
  const mongo = await new GenericContainer('mongo:8.0')
    .withExposedPorts(27017)
    .withWaitStrategy(Wait.forLogMessage(/Waiting for connections/))
    .start();
  const redis = await new GenericContainer('redis:7.4-alpine')
    .withExposedPorts(6379)
    .withWaitStrategy(Wait.forLogMessage(/Ready to accept connections/))
    .start();
  const pool = new Pool({ connectionString: pg.getConnectionUri() });
  await migrate(drizzle(pool), { migrationsFolder: 'migrations' });
  await pool.end();

  project.provide('databaseUrl', pg.getConnectionUri());
  project.provide('mongoUrl', `mongodb://${mongo.getHost()}:${mongo.getMappedPort(27017)}/padel`);
  project.provide('redisUrl', `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`);

  return async () => {
    await pg.stop();
    await mongo.stop();
    await redis.stop();
  };
}
