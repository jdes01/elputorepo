import { describe, expect, it } from 'vitest';
import { TimeOfDay } from '../../../../shared/domain/value-objects/time-of-day.value-object';
import { RecordingEventBus } from '../../../../shared/infrastructure/recording-event-bus';
import { Club } from '../../../domain/entities/club.entity';
import { ClubNotFound } from '../../../domain/errors/club.errors';
import { CourtWasOpenedEvent } from '../../../domain/events/court-was-opened.event';
import { ClubId } from '../../../domain/value-objects/club-id.value-object';
import { ClubName } from '../../../domain/value-objects/club-name.value-object';
import { CourtName } from '../../../domain/value-objects/court-name.value-object';
import { OpeningHours } from '../../../domain/value-objects/opening-hours.value-object';
import { InMemoryClubRepository } from '../../../infrastructure/persistence/in-memory-club.repository';
import { InMemoryCourtRepository } from '../../../infrastructure/persistence/in-memory-court.repository';
import { OpenCourtCommand } from './open-court.command';
import { OpenCourtHandler } from './open-court.handler';

const hours = OpeningHours.of(TimeOfDay.parse('09:00'), TimeOfDay.parse('22:30'));

describe('OpenCourtHandler', () => {
  it('abre la pista y publica que se ha abierto, con su club y su horario', async () => {
    const clubs = new InMemoryClubRepository();
    const events = new RecordingEventBus();
    const club = Club.register(await clubs.nextId(), ClubName.of('Club Norte'));
    await clubs.save(club);

    const court = await new OpenCourtHandler(clubs, new InMemoryCourtRepository(), events).execute(
      new OpenCourtCommand(club.id, CourtName.of('Pista 1'), hours),
    );

    const event = events.published[0] as CourtWasOpenedEvent;
    expect(event).toBeInstanceOf(CourtWasOpenedEvent);
    expect(event.courtId.equals(court.id)).toBe(true);
    expect(event.clubName.toString()).toBe('Club Norte');
    expect(event.openingHours.equals(hours)).toBe(true);
  });

  it('si el club no existe, ni pista ni evento', async () => {
    const events = new RecordingEventBus();
    const handler = new OpenCourtHandler(new InMemoryClubRepository(), new InMemoryCourtRepository(), events);

    await expect(handler.execute(new OpenCourtCommand(ClubId.of(9), CourtName.of('Pista 1'), hours))).rejects.toThrow(
      ClubNotFound,
    );
    expect(events.published).toHaveLength(0);
  });
});
