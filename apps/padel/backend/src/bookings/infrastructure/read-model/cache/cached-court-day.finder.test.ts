import { beforeEach, describe, expect, it } from 'vitest';
import { CourtId } from '../../../../clubs/domain/value-objects/court-id.value-object';
import { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';
import { CourtDayFinder, type CourtDayView } from '../../../application/queries/get-availability/court-day.finder';
import { CachedCourtDayFinder } from './cached-court-day.finder';
import { InMemoryCourtDayCache } from './in-memory-court-day.cache';

// Una fuente que cuenta cuantas veces se le pregunta: lo que la cache ahorra.
class CountingSource extends CourtDayFinder {
  readonly days = new Map<number, CourtDayView>();
  reads = 0;

  async find(courtId: CourtId): Promise<CourtDayView | undefined> {
    this.reads++;
    return this.days.get(courtId.toNumber());
  }
}

let source: CountingSource;
let cache: InMemoryCourtDayCache;
let finder: CachedCourtDayFinder;

const court = CourtId.of(1);
const date = CalendarDate.parse('2099-01-10');
const day: CourtDayView = { opens: '09:00', closes: '15:00', bookedStarts: ['10:30'] };

beforeEach(() => {
  source = new CountingSource();
  cache = new InMemoryCourtDayCache();
  finder = new CachedCourtDayFinder(source, cache);
  source.days.set(1, day);
});

describe('la agenda con cache', () => {
  it('la segunda lectura sale de la cache, sin ir a la fuente', async () => {
    expect(await finder.find(court, date)).toEqual(day);
    expect(await finder.find(court, date)).toEqual(day);

    expect(source.reads).toBe(1);
  });

  it('tras invalidar, vuelve a la fuente y ve el dato nuevo', async () => {
    await finder.find(court, date);
    source.days.set(1, { ...day, bookedStarts: ['10:30', '12:00'] });

    await cache.evict(court, date);

    expect((await finder.find(court, date))?.bookedStarts).toEqual(['10:30', '12:00']);
    expect(source.reads).toBe(2);
  });

  it('una pista que no existe no se guarda en la cache', async () => {
    expect(await finder.find(CourtId.of(2), date)).toBeUndefined();
    source.days.set(2, day);

    expect(await finder.find(CourtId.of(2), date)).toEqual(day);
  });
});
