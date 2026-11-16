import { Global, Module, type OnApplicationShutdown } from '@nestjs/common';
import { type Db, MongoClient } from 'mongodb';
import { loadConfig } from '../../config';

export const MONGO = Symbol('MONGO');

// Una conexion a Mongo para toda la app: ahi vive el modelo de lectura. Global:
// los finders y el proyector piden la base de datos en su constructor.
@Global()
@Module({
  providers: [
    {
      provide: MongoClient,
      useFactory: async () => {
        // Si Mongo no responde, se falla en 2 s en vez de los 30 s por defecto:
        // la escritura ya esta hecha y la peticion no deberia quedarse esperando.
        const client = new MongoClient(loadConfig().mongoUrl, { serverSelectionTimeoutMS: 2_000 });
        await client.connect();
        return client;
      },
    },
    { provide: MONGO, inject: [MongoClient], useFactory: (client: MongoClient): Db => client.db() },
  ],
  exports: [MONGO],
})
export class MongoModule implements OnApplicationShutdown {
  constructor(private readonly client: MongoClient) {}

  async onApplicationShutdown(): Promise<void> {
    await this.client.close();
  }
}
