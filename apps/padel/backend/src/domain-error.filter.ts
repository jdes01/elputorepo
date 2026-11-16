import { type ArgumentsHost, Catch, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { BookingNotFound, NotBookingOwner, SlotAlreadyTaken } from './bookings/booking.errors';
import { ClubNotFound, CourtNotFound } from './clubs/club.errors';
import { DomainError } from './shared/domain-error';

// El unico sitio que traduce errores de dominio a HTTP. Lo que no esta aqui es
// algo que el cliente pidio y no se puede hacer: un 400.
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(error: DomainError, host: ArgumentsHost) {
    const status = statusOf(error);
    host.switchToHttp().getResponse<Response>().status(status).json({ statusCode: status, message: error.message });
  }
}

function statusOf(error: DomainError): number {
  if (error instanceof ClubNotFound || error instanceof CourtNotFound || error instanceof BookingNotFound) return 404;
  if (error instanceof NotBookingOwner) return 403;
  if (error instanceof SlotAlreadyTaken) return 409;
  return 400;
}
