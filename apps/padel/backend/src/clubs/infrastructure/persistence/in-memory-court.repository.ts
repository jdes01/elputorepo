import type { Court } from '../../domain/entities/court.entity';
import { CourtRepository } from '../../domain/repositories/court.repository';
import type { ClubId } from '../../domain/value-objects/club-id.value-object';
import { CourtId } from '../../domain/value-objects/court-id.value-object';

export class InMemoryCourtRepository extends CourtRepository {
  private readonly courts = new Map<number, Court>();
  private lastId = 0;

  async nextId(): Promise<CourtId> {
    return CourtId.of(++this.lastId);
  }

  async save(court: Court): Promise<void> {
    this.courts.set(court.id.toNumber(), court);
  }

  async findById(id: CourtId): Promise<Court | undefined> {
    return this.courts.get(id.toNumber());
  }

  async findByClub(clubId: ClubId): Promise<Court[]> {
    return [...this.courts.values()].filter((court) => court.clubId.equals(clubId));
  }
}
