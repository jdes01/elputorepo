import { drizzle } from 'drizzle-orm/node-postgres';
import { type Db, MongoClient } from 'mongodb';
import { Pool } from 'pg';
import { createClient } from 'redis';
import type { Redis } from '../src/shared/infrastructure/redis.module';
import { inject } from 'vitest';
import type { Database } from '../src/shared/infrastructure/database.module';
import * as schema from '../src/schema';

export function testDatabase(): { db: Database; close: () => Promise<void> } {
  const pool = new Pool({ connectionString: inject('databaseUrl') });
  return { db: drizzle(pool, { schema }), close: () => pool.end() };
}

export async function testMongo(): Promise<{ mongo: Db; close: () => Promise<void> }> {
  const client = await new MongoClient(inject('mongoUrl')).connect();
  return { mongo: client.db(), close: () => client.close() };
}

export async function testRedis(): Promise<{ redis: Redis; close: () => Promise<void> }> {
  const redis: Redis = await createClient({ url: inject('redisUrl'), disableOfflineQueue: true }).connect();
  return { redis, close: () => redis.close() };
}
