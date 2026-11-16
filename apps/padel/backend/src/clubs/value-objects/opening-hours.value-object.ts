import { InvalidValueError } from '../../shared/invalid-value.error';
import type { TimeOfDay } from '../../shared/value-objects/time-of-day.value-object';
import { TimeSlot } from '../../shared/value-objects/time-slot.value-object';

// El horario de una pista: abre y cierra el mismo dia.
export class OpeningHours {
  private constructor(
    readonly opens: TimeOfDay,
    readonly closes: TimeOfDay,
  ) {}

  static of(opens: TimeOfDay, closes: TimeOfDay): OpeningHours {
    if (!opens.isBefore(closes))
      throw new InvalidValueError(`la pista no puede cerrar (${closes}) antes de abrir (${opens})`);
    return new OpeningHours(opens, closes);
  }

  contains(slot: TimeSlot): boolean {
    return !slot.start.isBefore(this.opens) && !slot.end.isAfter(this.closes);
  }

  // Las franjas del dia, una detras de otra desde que abre. Las que no caben antes del cierre no estan.
  slots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let start = this.opens;
    while (start.minutesUntil(this.closes) >= TimeSlot.MINUTES) {
      const slot = TimeSlot.startingAt(start);
      slots.push(slot);
      start = slot.end;
    }
    return slots;
  }

  equals(other: OpeningHours): boolean {
    return this.opens.equals(other.opens) && this.closes.equals(other.closes);
  }
}
