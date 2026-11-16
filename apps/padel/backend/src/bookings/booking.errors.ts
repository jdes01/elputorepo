import { DomainError } from '../shared/domain-error';

export class BookingNotFound extends DomainError {
  constructor() {
    super('la reserva no existe');
  }
}

export class BookingInThePast extends DomainError {
  constructor() {
    super('no se puede reservar en el pasado');
  }
}

export class SlotAlreadyTaken extends DomainError {
  constructor() {
    super('la pista ya esta reservada a esa hora');
  }
}

export class NotBookingOwner extends DomainError {
  constructor() {
    super('no es tu reserva');
  }
}

export class CancellationTooLate extends DomainError {
  constructor() {
    super('solo se cancela con 24h de antelacion');
  }
}
