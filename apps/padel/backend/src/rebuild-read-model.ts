import { drizzle } from 'drizzle-orm/node-postgres';
import { MongoClient } from 'mongodb';
import { Pool } from 'pg';
import { MongoReadModelProjector } from './bookings/infrastructure/read-model/mongo-read-model.projector';
import { rebuildReadModel } from './bookings/infrastructure/read-model/rebuild-read-model';
import { loadConfig } from './config';
import * as schema from './schema';

// `task backend:read-model:rebuild`: rehace el modelo de lectura de Mongo desde
// Postgres. Para cuando se ha perdido un evento, se cambia la forma de una vista
// o se arranca con datos que ya existian.
async function main() {
  const { databaseUrl, mongoUrl } = loadConfig();
  const pool = new Pool({ connectionString: databaseUrl });
  const mongo = await new MongoClient(mongoUrl).connect();
  try {
    const rebuilt = await rebuildReadModel(drizzle(pool, { schema }), new MongoReadModelProjector(mongo.db()));
    console.log(`modelo de lectura rehecho: ${rebuilt.courts} pistas, ${rebuilt.bookings} reservas`);
  } finally {
    await pool.end();
    await mongo.close();
  }
}

main();
