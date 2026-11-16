import { Inject, Injectable } from '@nestjs/common';
import type { CourtId } from '../../../../clubs/domain/value-objects/court-id.value-object';
import type { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';
import { REDIS, type Redis } from '../../../../shared/infrastructure/redis.module';
import type { CourtDayView } from '../../../application/queries/get-availability/court-day.finder';
import { CourtDayCache, courtDayKey } from './court-day.cache';

// Cuanto vive una entrada aunque nadie la invalide. Es la red de seguridad: si
// alguna invalidacion se pierde, el dato viejo dura como mucho esto.
const TTL_SECONDS = 60;

@Injectable()
export class RedisCourtDayCache extends CourtDayCache {
  constructor(@Inject(REDIS) private readonly redis: Redis) {
    super();
  }

  async get(courtId: CourtId, date: CalendarDate): Promise<CourtDayView | undefined> {
    const cached = await this.quietly(() => this.redis.get(courtDayKey(courtId, date)));
    return cached ? (JSON.parse(cached) as CourtDayView) : undefined;
  }

  async set(courtId: CourtId, date: CalendarDate, view: CourtDayView): Promise<void> {
    await this.quietly(() => this.redis.set(courtDayKey(courtId, date), JSON.stringify(view), { EX: TTL_SECONDS }));
  }

  async evict(courtId: CourtId, date: CalendarDate): Promise<void> {
    await this.quietly(() => this.redis.del(courtDayKey(courtId, date)));
  }

  async clear(): Promise<void> {
    const keys = await this.quietly(() => this.redis.keys('court-day:*'));
    if (keys && keys.length > 0) await this.quietly(() => this.redis.del(keys));
  }

  // Si Redis falla, se apunta y se sigue como si la cache estuviera vacia.
  private async quietly<T>(command: () => Promise<T>): Promise<T | undefined> {
    try {
      return await command();
    } catch (error) {
      console.error('cache: Redis no responde, se sigue sin cache:', (error as Error).message);
      return undefined;
    }
  }
}
