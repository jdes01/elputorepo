import { describe, expect, it } from 'vitest';
import { InvalidValueError } from '../../../shared/domain/errors/invalid-value.error';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { TimeSlot } from '../../../shared/domain/value-objects/time-slot.value-object';
import { OpeningHours } from './opening-hours.value-object';

const hours = (opens: string, closes: string) => OpeningHours.of(TimeOfDay.parse(opens), TimeOfDay.parse(closes));
const slotAt = (start: string) => TimeSlot.startingAt(TimeOfDay.parse(start));

describe('OpeningHours', () => {
  it('no puede cerrar antes de abrir', () => {
    expect(() => hours('22:00', '09:00')).toThrow(InvalidValueError);
  });

  it('no puede cerrar a la misma hora que abre', () => {
    expect(() => hours('09:00', '09:00')).toThrow(InvalidValueError);
  });

  it('contiene las franjas que empiezan y acaban dentro del horario', () => {
    const opening = hours('09:00', '22:30');

    expect(opening.contains(slotAt('09:00'))).toBe(true);
    expect(opening.contains(slotAt('21:00'))).toBe(true);
    expect(opening.contains(slotAt('08:00'))).toBe(false);
    expect(opening.contains(slotAt('21:30'))).toBe(false);
  });

  it('reparte el dia en franjas seguidas desde que abre', () => {
    const slots = hours('09:00', '15:00').slots();

    expect(slots.map((s) => s.start.toString())).toEqual(['09:00', '10:30', '12:00', '13:30']);
  });

  it('deja fuera la franja que no cabe antes del cierre', () => {
    const slots = hours('09:00', '11:59').slots();

    expect(slots.map((s) => s.start.toString())).toEqual(['09:00']);
  });
});
