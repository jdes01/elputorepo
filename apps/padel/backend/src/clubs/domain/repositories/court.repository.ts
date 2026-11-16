import type { Court } from '../entities/court.entity';
import type { CourtId } from '../value-objects/court-id.value-object';

export abstract class CourtRepository {
  abstract nextId(): Promise<CourtId>;
  abstract save(court: Court): Promise<void>;
  abstract findById(id: CourtId): Promise<Court | undefined>;
}
