import { DomainError } from '../../../shared/domain/errors/domain-error';
import type { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';

export class ClubNotFound extends DomainError {
  constructor() {
    super('el club no existe');
  }
}

export class CourtNotFound extends DomainError {
  constructor() {
    super('la pista no existe');
  }
}

export class SlotOutsideOpeningHours extends DomainError {
  constructor(start: TimeOfDay) {
    super(`a las ${start} no empieza ninguna franja de la pista`);
  }
}
