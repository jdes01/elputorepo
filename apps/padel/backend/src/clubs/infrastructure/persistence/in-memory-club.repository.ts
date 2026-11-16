import type { Club } from '../../domain/entities/club.entity';
import { ClubRepository } from '../../domain/repositories/club.repository';
import { ClubId } from '../../domain/value-objects/club-id.value-object';

// El mismo puerto, en memoria: para tests sin BD.
export class InMemoryClubRepository extends ClubRepository {
  private readonly clubs = new Map<number, Club>();
  private lastId = 0;

  async nextId(): Promise<ClubId> {
    return ClubId.of(++this.lastId);
  }

  async save(club: Club): Promise<void> {
    this.clubs.set(club.id.toNumber(), club);
  }

  async findById(id: ClubId): Promise<Club | undefined> {
    return this.clubs.get(id.toNumber());
  }

  // Fuera del puerto: lo leen los finders en memoria.
  all(): Club[] {
    return [...this.clubs.values()];
  }
}
