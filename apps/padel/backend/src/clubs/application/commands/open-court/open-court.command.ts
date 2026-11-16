import type { ClubId } from '../../../domain/value-objects/club-id.value-object';
import type { CourtName } from '../../../domain/value-objects/court-name.value-object';
import type { OpeningHours } from '../../../domain/value-objects/opening-hours.value-object';

export class OpenCourtCommand {
  constructor(
    readonly clubId: ClubId,
    readonly name: CourtName,
    readonly openingHours: OpeningHours,
  ) {}
}
