import type { Club } from './club.entity';
import type { ClubId } from '../value-objects/club-id.value-object';
import type { CourtId } from '../value-objects/court-id.value-object';
import type { CourtName } from '../value-objects/court-name.value-object';
import type { OpeningHours } from '../value-objects/opening-hours.value-object';

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

  equals(other: Court): boolean {
    return this.id.equals(other.id);
  }
}
