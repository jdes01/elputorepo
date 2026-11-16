import { Global, Inject, Logger, Module, type OnApplicationShutdown } from '@nestjs/common';
import { createClient } from 'redis';
import { loadConfig } from '../../config';

export const REDIS = Symbol('REDIS');

const connectTo = (url: string) => createClient({ url, disableOfflineQueue: true });
export type Redis = ReturnType<typeof connectTo>;

// Una conexion a Redis para toda la app: ahi vive la cache. Sin cola offline: si
// Redis no esta, cada orden falla en el momento en vez de esperar a que vuelva.
@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: async (): Promise<Redis> => {
        const client = connectTo(loadConfig().redisUrl);
        // node-redis exige escuchar 'error': si no, un Redis caido tumba el proceso.
        const logger = new Logger('Redis');
        client.on('error', (error: Error) => logger.error(error.message));
        await client.connect();
        return client;
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.redis.isOpen) await this.redis.close();
  }
}
