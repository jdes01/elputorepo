import { drizzle } from 'drizzle-orm/node-postgres';
import { MongoClient } from 'mongodb';
import { Pool } from 'pg';
import { createClient } from 'redis';
import { RedisCourtDayCache } from './bookings/infrastructure/read-model/cache/redis-court-day.cache';
import { MongoReadModelProjector } from './bookings/infrastructure/read-model/mongo-read-model.projector';
import { rebuildReadModel } from './bookings/infrastructure/read-model/rebuild-read-model';
import { loadConfig } from './config';
import * as schema from './schema';

// `task backend:read-model:rebuild`: rehace el modelo de lectura de Mongo desde
// Postgres, y vacia la cache. Para cuando se ha perdido un evento, se cambia la forma de una vista
// o se arranca con datos que ya existian.
async function main() {
  const { databaseUrl, mongoUrl, redisUrl } = loadConfig();
  const pool = new Pool({ connectionString: databaseUrl });
  const mongo = await new MongoClient(mongoUrl).connect();
  const redis = await createClient({ url: redisUrl }).connect();
  try {
    const projector = new MongoReadModelProjector(mongo.db(), new RedisCourtDayCache(redis));
    const rebuilt = await rebuildReadModel(drizzle(pool, { schema }), projector);
    console.log(`modelo de lectura rehecho: ${rebuilt.courts} pistas, ${rebuilt.bookings} reservas`);
  } finally {
    await pool.end();
    await mongo.close();
    await redis.close();
  }
}

main();
