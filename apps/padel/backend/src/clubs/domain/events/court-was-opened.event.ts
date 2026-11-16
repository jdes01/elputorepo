import { DomainEvent } from '../../../shared/domain/events/domain-event';
import type { ClubId } from '../value-objects/club-id.value-object';
import type { ClubName } from '../value-objects/club-name.value-object';
import type { CourtId } from '../value-objects/court-id.value-object';
import type { CourtName } from '../value-objects/court-name.value-object';
import type { OpeningHours } from '../value-objects/opening-hours.value-object';

export class CourtWasOpenedEvent extends DomainEvent {
  constructor(
    readonly courtId: CourtId,
    readonly clubId: ClubId,
    readonly courtName: CourtName,
    readonly clubName: ClubName,
    readonly openingHours: OpeningHours,
    occurredAt: Date,
  ) {
    super(occurredAt);
  }
}
