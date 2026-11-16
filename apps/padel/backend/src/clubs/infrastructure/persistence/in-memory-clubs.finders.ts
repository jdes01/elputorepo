import { ClubsFinder, type ClubView } from '../../application/queries/list-clubs/clubs.finder';
import { CourtsFinder, type CourtView } from '../../application/queries/list-courts/courts.finder';
import type { ClubId } from '../../domain/value-objects/club-id.value-object';
import type { InMemoryClubRepository } from './in-memory-club.repository';
import type { InMemoryCourtRepository } from './in-memory-court.repository';

// Los finders, en memoria: leen lo que guardaron los repositorios en memoria.
export class InMemoryClubsFinder extends ClubsFinder {
  constructor(private readonly clubs: InMemoryClubRepository) {
    super();
  }

  async all(): Promise<ClubView[]> {
    return this.clubs.all().map((club) => ({ id: club.id.toNumber(), name: club.name.toString() }));
  }
}

export class InMemoryCourtsFinder extends CourtsFinder {
  constructor(private readonly courts: InMemoryCourtRepository) {
    super();
  }

  async ofClub(clubId: ClubId): Promise<CourtView[]> {
    return this.courts
      .all()
      .filter((court) => court.clubId.equals(clubId))
      .map((court) => ({
        id: court.id.toNumber(),
        clubId: court.clubId.toNumber(),
        name: court.name.toString(),
        opens: court.openingHours.opens.toString(),
        closes: court.openingHours.closes.toString(),
      }));
  }
}
