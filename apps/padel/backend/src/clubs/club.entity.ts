import type { ClubId } from './value-objects/club-id.value-object';
import type { ClubName } from './value-objects/club-name.value-object';

export class Club {
  private constructor(
    readonly id: ClubId,
    readonly name: ClubName,
  ) {}

  static register(id: ClubId, name: ClubName): Club {
    return new Club(id, name);
  }

  // Un club que ya existia: se reconstruye tal cual, sin volver a aplicar reglas de alta.
  static restore(id: ClubId, name: ClubName): Club {
    return new Club(id, name);
  }

  equals(other: Club): boolean {
    return this.id.equals(other.id);
  }
}
