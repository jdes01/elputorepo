import { beforeEach, describe, expect, it } from 'vitest';
import { Club } from '../../../../clubs/domain/entities/club.entity';
import { Court } from '../../../../clubs/domain/entities/court.entity';
import { ClubName } from '../../../../clubs/domain/value-objects/club-name.value-object';
import { CourtName } from '../../../../clubs/domain/value-objects/court-name.value-object';
import { OpeningHours } from '../../../../clubs/domain/value-objects/opening-hours.value-object';
import { InMemoryClubRepository } from '../../../../clubs/infrastructure/persistence/in-memory-club.repository';
import { InMemoryCourtRepository } from '../../../../clubs/infrastructure/persistence/in-memory-court.repository';
import { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../../shared/domain/value-objects/time-of-day.value-object';
import { TimeSlot } from '../../../../shared/domain/value-objects/time-slot.value-object';
import { RecordingMailer } from '../../../../shared/infrastructure/recording-mailer';
import { BookingWasCancelledEvent } from '../../../domain/events/booking-was-cancelled.event';
import { BookingId } from '../../../domain/value-objects/booking-id.value-object';
import { UserId } from '../../../domain/value-objects/user-id.value-object';
import { SendCancellationConfirmationHandler } from './send-cancellation-confirmation.handler';

let clubs: InMemoryClubRepository;
let courts: InMemoryCourtRepository;
let mailer: RecordingMailer;
let handler: SendCancellationConfirmationHandler;

beforeEach(() => {
  clubs = new InMemoryClubRepository();
  courts = new InMemoryCourtRepository();
  mailer = new RecordingMailer();
  handler = new SendCancellationConfirmationHandler(courts, clubs, mailer);
});

async function bookingWasCancelledIn(clubName: string) {
  const club = Club.register(await clubs.nextId(), ClubName.of(clubName));
  await clubs.save(club);
  const hours = OpeningHours.of(TimeOfDay.parse('09:00'), TimeOfDay.parse('22:30'));
  const court = Court.open(await courts.nextId(), club, CourtName.of('Pista 1'), hours);
  await courts.save(court);
  return new BookingWasCancelledEvent(
    BookingId.of(1),
    court.id,
    UserId.of('ana@padel.local'),
    CalendarDate.parse('2099-01-10'),
    TimeSlot.startingAt(TimeOfDay.parse('10:30')),
    new Date(),
  );
}

describe('SendCancellationConfirmationHandler', () => {
  it('manda el correo a quien tenia la reserva, con la pista, el club y la franja', async () => {
    await handler.handle(await bookingWasCancelledIn('Club Norte'));

    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0]).toMatchObject({ to: 'ana@padel.local', subject: 'Reserva cancelada' });
    expect(mailer.sent[0]!.html).toContain('Club Norte - Pista 1');
    expect(mailer.sent[0]!.html).toContain('2099-01-10 de 10:30 a 12:00');
  });
});
