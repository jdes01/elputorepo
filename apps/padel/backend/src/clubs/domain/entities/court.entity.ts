import type { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import type { TimeSlot } from '../../../shared/domain/value-objects/time-slot.value-object';
import { SlotOutsideOpeningHours } from '../errors/club.errors';
import type { Club } from './club.entity';
import type { ClubId } from '../value-objects/club-id.value-object';
import type { CourtId } from '../value-objects/court-id.value-object';
import type { CourtName } from '../value-objects/court-name.value-object';
import type { OpeningHours } from '../value-objects/opening-hours.value-object';

export interface SlotAvailability {
  slot: TimeSlot;
  free: boolean;
}

export class Court {
  private constructor(
    readonly id: CourtId,
    readonly clubId: ClubId,
    readonly name: CourtName,
    readonly openingHours: OpeningHours,
  ) {}

  static open(id: CourtId, club: Club, name: CourtName, openingHours: OpeningHours): Court {
    return new Court(id, club.id, name, openingHours);
  }

  static restore(id: CourtId, clubId: ClubId, name: CourtName, openingHours: OpeningHours): Court {
    return new Court(id, clubId, name, openingHours);
  }

  // Solo se juega en las franjas de la rejilla del horario: a las 09:00, 10:30,
  // 12:00... si abre a las 09:00. Una franja a las 10:00 no existe.
  slotAt(start: TimeOfDay): TimeSlot {
    const slot = this.openingHours.slots().find((s) => s.start.equals(start));
    if (!slot) throw new SlotOutsideOpeningHours(start);
    return slot;
  }

  availability(taken: TimeSlot[]): SlotAvailability[] {
    return this.openingHours.slots().map((slot) => ({ slot, free: !taken.some((t) => t.overlaps(slot)) }));
  }

  equals(other: Court): boolean {
    return this.id.equals(other.id);
  }
}
