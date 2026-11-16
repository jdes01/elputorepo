import type { TimeOfDay } from './time-of-day.value-object';

// Una franja de juego: 90 minutos desde su hora de inicio.
export class TimeSlot {
  static readonly MINUTES = 90;

  private constructor(
    readonly start: TimeOfDay,
    readonly end: TimeOfDay,
  ) {}

  static startingAt(start: TimeOfDay): TimeSlot {
    return new TimeSlot(start, start.plusMinutes(TimeSlot.MINUTES));
  }

  // Comparten algun minuto. Que una acabe justo cuando empieza la otra no es solaparse.
  overlaps(other: TimeSlot): boolean {
    return this.start.isBefore(other.end) && other.start.isBefore(this.end);
  }

  equals(other: TimeSlot): boolean {
    return this.start.equals(other.start);
  }
}
