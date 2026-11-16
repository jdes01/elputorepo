import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { pino } from 'pino';
import { loadConfig } from './config';

const logger = pino();

// Aplica las migraciones pendientes y sale. Es lo que corre la imagen antes de
// la app: drizzle-kit es una devDependency y no viaja en ella, asi que se usa
// el migrador de drizzle-orm, que lee las mismas carpetas SQL.
async function main() {
  const pool = new Pool({ connectionString: loadConfig().databaseUrl });
  await migrate(drizzle(pool), { migrationsFolder: 'migrations' });
  await pool.end();
  logger.info('migraciones aplicadas');
}

main().catch((error: unknown) => {
  logger.error(error);
  process.exit(1);
});
