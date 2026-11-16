import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { inject } from 'vitest';
import type { Database } from '../src/shared/infrastructure/database.module';
import * as schema from '../src/schema';

export function testDatabase(): { db: Database; close: () => Promise<void> } {
  const pool = new Pool({ connectionString: inject('databaseUrl') });
  return { db: drizzle(pool, { schema }), close: () => pool.end() };
}
