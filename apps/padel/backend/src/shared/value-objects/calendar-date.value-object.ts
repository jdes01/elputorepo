import { InvalidValueError } from '../invalid-value.error';
import type { TimeOfDay } from './time-of-day.value-object';

// Un dia del calendario, sin hora: "2026-11-20". Rechaza los que no existen.
export class CalendarDate {
  private constructor(private readonly date: Temporal.PlainDate) {}

  static parse(text: string): CalendarDate {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text))
      throw new InvalidValueError(`fecha invalida: "${text}" (formato AAAA-MM-DD)`);
    try {
      return new CalendarDate(Temporal.PlainDate.from(text, { overflow: 'reject' }));
    } catch {
      throw new InvalidValueError(`fecha invalida: "${text}" no existe`);
    }
  }

  // El instante en que empieza `time` ese dia, en `timeZone`.
  at(time: TimeOfDay, timeZone: string): Date {
    const zoned = this.date.toZonedDateTime({ timeZone, plainTime: Temporal.PlainTime.from(time.toString()) });
    return new Date(zoned.epochMilliseconds);
  }

  equals(other: CalendarDate): boolean {
    return this.date.equals(other.date);
  }

  toString(): string {
    return this.date.toString();
  }
}
