import { describe, expect, it } from 'vitest';
import { InvalidValueError } from '../errors/invalid-value.error';
import { TimeOfDay } from './time-of-day.value-object';
import { TimeSlot } from './time-slot.value-object';

const slotAt = (start: string) => TimeSlot.startingAt(TimeOfDay.parse(start));

describe('TimeSlot', () => {
  it('dura 90 minutos', () => {
    expect(slotAt('10:30').end.toString()).toBe('12:00');
  });

  it('no puede acabar al dia siguiente', () => {
    expect(() => slotAt('23:00')).toThrow(InvalidValueError);
  });

  it('se solapa con una franja que empieza dentro de ella', () => {
    expect(slotAt('10:30').overlaps(slotAt('11:00'))).toBe(true);
    expect(slotAt('11:00').overlaps(slotAt('10:30'))).toBe(true);
  });

  it('se solapa consigo misma', () => {
    expect(slotAt('10:30').overlaps(slotAt('10:30'))).toBe(true);
  });

  it('no se solapa con la que empieza justo cuando acaba', () => {
    expect(slotAt('10:30').overlaps(slotAt('12:00'))).toBe(false);
    expect(slotAt('12:00').overlaps(slotAt('10:30'))).toBe(false);
  });
});
