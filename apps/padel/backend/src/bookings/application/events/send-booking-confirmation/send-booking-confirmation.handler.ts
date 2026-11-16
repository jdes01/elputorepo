import { Injectable } from '@nestjs/common';
import { ClubRepository } from '../../../../clubs/domain/repositories/club.repository';
import { CourtRepository } from '../../../../clubs/domain/repositories/court.repository';
import { escapeHtml } from '../../../../shared/application/escape-html';
import type { EventHandler } from '../../../../shared/application/event-bus';
import { Mailer } from '../../../../shared/application/mailer';
import type { CourtWasBookedEvent } from '../../../domain/events/court-was-booked.event';

// Se ha reservado una pista: se avisa a quien reservo. Reservar no sabe que esto
// existe.
@Injectable()
export class SendBookingConfirmationHandler implements EventHandler<CourtWasBookedEvent> {
  constructor(
    private readonly courts: CourtRepository,
    private readonly clubs: ClubRepository,
    private readonly mailer: Mailer,
  ) {}

  async handle({ courtId, userId, date, slot }: CourtWasBookedEvent): Promise<void> {
    const court = (await this.courts.findById(courtId))!;
    const club = (await this.clubs.findById(court.clubId))!;
    const where = escapeHtml(`${club.name} - ${court.name}`);
    await this.mailer.send(
      userId.toString(),
      'Reserva confirmada',
      `<h1>Reserva confirmada</h1><p>${where}</p><p>${date} de ${slot.start} a ${slot.end}</p>`,
    );
  }
}
