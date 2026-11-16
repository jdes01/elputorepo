import { describe, expect, it } from 'vitest';
import { InvalidValueError } from '../invalid-value.error';
import { CalendarDate } from './calendar-date.value-object';
import { TimeOfDay } from './time-of-day.value-object';

describe('CalendarDate', () => {
  it('se lee y se escribe como AAAA-MM-DD', () => {
    expect(CalendarDate.parse('2026-11-20').toString()).toBe('2026-11-20');
  });

  it.each(['2026-02-30', '2026-13-01', '20/11/2026', '2026-1-5'])('rechaza "%s"', (text) => {
    expect(() => CalendarDate.parse(text)).toThrow(InvalidValueError);
  });

  it('acepta el 29 de febrero de un bisiesto', () => {
    expect(CalendarDate.parse('2028-02-29').toString()).toBe('2028-02-29');
  });

  it('da el instante de una hora de ese dia', () => {
    const instant = CalendarDate.parse('2026-11-20').at(TimeOfDay.parse('10:30'));

    expect(instant).toEqual(new Date(2026, 10, 20, 10, 30));
  });
});
