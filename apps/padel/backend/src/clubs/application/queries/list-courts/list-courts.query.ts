import type { ClubId } from '../../../domain/value-objects/club-id.value-object';

export class ListCourtsQuery {
  constructor(readonly clubId: ClubId) {}
}
