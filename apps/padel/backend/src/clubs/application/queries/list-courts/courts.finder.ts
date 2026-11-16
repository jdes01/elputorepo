import type { ClubId } from '../../../domain/value-objects/club-id.value-object';

export interface CourtView {
  id: number;
  clubId: number;
  name: string;
  opens: string;
  closes: string;
}

export abstract class CourtsFinder {
  abstract ofClub(clubId: ClubId): Promise<CourtView[]>;
}
