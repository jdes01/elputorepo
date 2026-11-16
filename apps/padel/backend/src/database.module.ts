import { Global, Module } from '@nestjs/common';
import { Pool } from 'pg';
import { loadConfig } from './config';

// Un pool para toda la app. Global: cualquier service lo pide en su constructor.
@Global()
@Module({
  providers: [{ provide: Pool, useFactory: () => new Pool({ connectionString: loadConfig().databaseUrl }) }],
  exports: [Pool],
})
export class DatabaseModule {}
