import type { Club } from '../entities/club.entity';
import type { ClubId } from '../value-objects/club-id.value-object';

// El puerto: lo que el dominio necesita de un almacen de clubs, sin decir cual.
// Es una clase abstracta y no una interface porque Nest la usa tambien como
// token de inyeccion.
export abstract class ClubRepository {
  abstract nextId(): Promise<ClubId>;
  abstract save(club: Club): Promise<void>;
  abstract findById(id: ClubId): Promise<Club | undefined>;
}
