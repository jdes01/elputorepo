import { InvalidValueError } from '../../../shared/domain/errors/invalid-value.error';
import type { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { TimeSlot } from '../../../shared/domain/value-objects/time-slot.value-object';

export interface SlotAvailability {
  slot: TimeSlot;
  free: boolean;
}

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

  // La rejilla del dia con cada franja libre u ocupada por alguna de `taken`.
  availability(taken: TimeSlot[]): SlotAvailability[] {
    return this.slots().map((slot) => ({ slot, free: !taken.some((t) => t.overlaps(slot)) }));
  }

  equals(other: OpeningHours): boolean {
    return this.opens.equals(other.opens) && this.closes.equals(other.closes);
  }
}
