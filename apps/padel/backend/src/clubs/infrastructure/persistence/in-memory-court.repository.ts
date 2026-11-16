import type { Court } from '../../domain/entities/court.entity';
import { CourtRepository } from '../../domain/repositories/court.repository';
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

  // Fuera del puerto: lo leen los finders en memoria.
  all(): Court[] {
    return [...this.courts.values()];
  }
}
