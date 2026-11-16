import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { testMongo, testRedis } from '../../../../../integration/database';
import { CourtWasOpenedEvent } from '../../../../clubs/domain/events/court-was-opened.event';
import { ClubId } from '../../../../clubs/domain/value-objects/club-id.value-object';
import { ClubName } from '../../../../clubs/domain/value-objects/club-name.value-object';
import { CourtId } from '../../../../clubs/domain/value-objects/court-id.value-object';
import { CourtName } from '../../../../clubs/domain/value-objects/court-name.value-object';
import { OpeningHours } from '../../../../clubs/domain/value-objects/opening-hours.value-object';
import { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../../shared/domain/value-objects/time-of-day.value-object';
import { TimeSlot } from '../../../../shared/domain/value-objects/time-slot.value-object';
import { CourtWasBookedEvent } from '../../../domain/events/court-was-booked.event';
import { BookingId } from '../../../domain/value-objects/booking-id.value-object';
import { UserId } from '../../../domain/value-objects/user-id.value-object';
import { MongoCourtDayFinder } from '../mongo-court-day.finder';
import { MongoReadModelProjector } from '../mongo-read-model.projector';
import { CachedCourtDayFinder } from './cached-court-day.finder';
import { courtDayKey } from './court-day.cache';
import { RedisCourtDayCache } from './redis-court-day.cache';

let mongo: Awaited<ReturnType<typeof testMongo>>;
let redis: Awaited<ReturnType<typeof testRedis>>;
let cache: RedisCourtDayCache;
let projector: MongoReadModelProjector;
let days: CachedCourtDayFinder;

beforeAll(async () => {
  mongo = await testMongo();
  redis = await testRedis();
  cache = new RedisCourtDayCache(redis.redis);
  projector = new MongoReadModelProjector(mongo.mongo, cache);
  days = new CachedCourtDayFinder(new MongoCourtDayFinder(mongo.mongo), cache);
});
afterAll(async () => {
  await mongo.close();
  if (redis.redis.isOpen) await redis.close();
});

const now = new Date();
const date = CalendarDate.parse('2099-02-10');
const day = { opens: '09:00', closes: '15:00', bookedStarts: [] };

const opened = (courtId: number) =>
  new CourtWasOpenedEvent(
    CourtId.of(courtId),
    ClubId.of(1),
    CourtName.of('Pista 1'),
    ClubName.of('Club Norte'),
    OpeningHours.of(TimeOfDay.parse('09:00'), TimeOfDay.parse('15:00')),
    now,
  );
const booked = (bookingId: number, courtId: number, start: string) =>
  new CourtWasBookedEvent(
    BookingId.of(bookingId),
    CourtId.of(courtId),
    UserId.of('ana@padel.local'),
    date,
    TimeSlot.startingAt(TimeOfDay.parse(start)),
    now,
  );

describe('la cache de la agenda en Redis', () => {
  it('guarda y devuelve la agenda, con caducidad', async () => {
    await cache.set(CourtId.of(201), date, day);

    expect(await cache.get(CourtId.of(201), date)).toEqual(day);
    const ttl = await redis.redis.ttl(courtDayKey(CourtId.of(201), date));
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(60);
  });

  it('reservar invalida la agenda cacheada: la siguiente lectura ve la franja ocupada', async () => {
    await projector.courtWasOpened(opened(202));
    expect((await days.find(CourtId.of(202), date))?.bookedStarts).toEqual([]);
    expect(await cache.get(CourtId.of(202), date)).toBeDefined();

    await projector.courtWasBooked(booked(20, 202, '10:30'));

    expect(await cache.get(CourtId.of(202), date)).toBeUndefined();
    expect((await days.find(CourtId.of(202), date))?.bookedStarts).toEqual(['10:30']);
  });

  it('clear vacia solo las agendas', async () => {
    await cache.set(CourtId.of(203), date, day);
    await redis.redis.set('otra-cosa', 'x');

    await cache.clear();

    expect(await cache.get(CourtId.of(203), date)).toBeUndefined();
    expect(await redis.redis.get('otra-cosa')).toBe('x');
  });

  // El ultimo: cierra la conexion.
  it('con Redis caido se comporta como una cache vacia, sin lanzar', async () => {
    await projector.courtWasOpened(opened(204));
    await redis.close();

    expect(await cache.get(CourtId.of(204), date)).toBeUndefined();
    await expect(cache.set(CourtId.of(204), date, day)).resolves.toBeUndefined();
    expect(await days.find(CourtId.of(204), date)).toEqual(day);
  });
});
