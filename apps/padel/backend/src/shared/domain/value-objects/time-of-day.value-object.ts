import { InvalidValueError } from '../errors/invalid-value.error';

const MINUTES_PER_DAY = 24 * 60;
const pad = (n: number) => String(n).padStart(2, '0');

// Una hora del dia, de 00:00 a 23:59. Por dentro, minutos desde medianoche.
export class TimeOfDay {
  private constructor(private readonly minutes: number) {}

  static parse(text: string): TimeOfDay {
    const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(text);
    if (!match) throw new InvalidValueError(`hora invalida: "${text}" (formato HH:MM)`);
    return new TimeOfDay(Number(match[1]) * 60 + Number(match[2]));
  }

  plusMinutes(minutes: number): TimeOfDay {
    const total = this.minutes + minutes;
    if (total >= MINUTES_PER_DAY) throw new InvalidValueError(`${this} mas ${minutes} minutos se sale del dia`);
    return new TimeOfDay(total);
  }

  minutesUntil(other: TimeOfDay): number {
    return other.minutes - this.minutes;
  }

  isBefore(other: TimeOfDay): boolean {
    return this.minutes < other.minutes;
  }

  isAfter(other: TimeOfDay): boolean {
    return this.minutes > other.minutes;
  }

  equals(other: TimeOfDay): boolean {
    return this.minutes === other.minutes;
  }

  toString(): string {
    return `${pad(Math.floor(this.minutes / 60))}:${pad(this.minutes % 60)}`;
  }
}
