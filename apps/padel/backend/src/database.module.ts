import { Global, Module } from '@nestjs/common';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { loadConfig } from './config';
import * as schema from './schema';

export type Database = NodePgDatabase<typeof schema>;
export const DATABASE = Symbol('DATABASE');

// Un pool y un cliente de drizzle para toda la app. Global: cualquier
// repositorio pide el cliente en su constructor.
@Global()
@Module({
  providers: [
    { provide: Pool, useFactory: () => new Pool({ connectionString: loadConfig().databaseUrl }) },
    { provide: DATABASE, inject: [Pool], useFactory: (pool: Pool): Database => drizzle(pool, { schema }) },
  ],
  exports: [DATABASE],
})
export class DatabaseModule {}
