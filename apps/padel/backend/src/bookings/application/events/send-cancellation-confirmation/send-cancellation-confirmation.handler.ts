import { Injectable } from '@nestjs/common';
import { ClubRepository } from '../../../../clubs/domain/repositories/club.repository';
import { CourtRepository } from '../../../../clubs/domain/repositories/court.repository';
import { escapeHtml } from '../../../../shared/application/escape-html';
import type { EventHandler } from '../../../../shared/application/event-bus';
import { Mailer } from '../../../../shared/application/mailer';
import type { BookingWasCancelledEvent } from '../../../domain/events/booking-was-cancelled.event';

// Se ha cancelado una reserva: se avisa a quien la tenia. Cancelar no sabe que
// esto existe.
@Injectable()
export class SendCancellationConfirmationHandler implements EventHandler<BookingWasCancelledEvent> {
  constructor(
    private readonly courts: CourtRepository,
    private readonly clubs: ClubRepository,
    private readonly mailer: Mailer,
  ) {}

  async handle({ courtId, userId, date, slot }: BookingWasCancelledEvent): Promise<void> {
    const court = (await this.courts.findById(courtId))!;
    const club = (await this.clubs.findById(court.clubId))!;
    const where = escapeHtml(`${club.name} - ${court.name}`);
    await this.mailer.send(
      userId.toString(),
      'Reserva cancelada',
      `<h1>Reserva cancelada</h1><p>${where}</p><p>${date} de ${slot.start} a ${slot.end}</p>`,
    );
  }
}
