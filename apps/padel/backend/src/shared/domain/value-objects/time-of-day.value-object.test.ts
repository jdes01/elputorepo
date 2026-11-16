import { describe, expect, it } from 'vitest';
import { InvalidValueError } from '../errors/invalid-value.error';
import { TimeOfDay } from './time-of-day.value-object';

describe('TimeOfDay', () => {
  it('se lee y se escribe como HH:MM', () => {
    expect(TimeOfDay.parse('09:05').toString()).toBe('09:05');
  });

  it.each(['9:00', '24:00', '12:60', 'mediodia'])('rechaza "%s"', (text) => {
    expect(() => TimeOfDay.parse(text)).toThrow(InvalidValueError);
  });

  it('suma minutos cambiando de hora', () => {
    expect(TimeOfDay.parse('10:30').plusMinutes(90).toString()).toBe('12:00');
  });

  it('no deja salirse del dia', () => {
    expect(() => TimeOfDay.parse('23:00').plusMinutes(90)).toThrow(InvalidValueError);
  });

  it('se compara por su valor', () => {
    const nine = TimeOfDay.parse('09:00');
    const ten = TimeOfDay.parse('10:00');

    expect(nine.isBefore(ten)).toBe(true);
    expect(ten.isAfter(nine)).toBe(true);
    expect(nine.equals(TimeOfDay.parse('09:00'))).toBe(true);
    expect(nine.minutesUntil(ten)).toBe(60);
  });
});
