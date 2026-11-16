import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { testDatabase, testMongo } from '../../../../integration/database';
import { seed } from '../../../../integration/seed';
import { CourtWasOpenedEvent } from '../../../clubs/domain/events/court-was-opened.event';
import { ClubId } from '../../../clubs/domain/value-objects/club-id.value-object';
import { ClubName } from '../../../clubs/domain/value-objects/club-name.value-object';
import { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { CourtName } from '../../../clubs/domain/value-objects/court-name.value-object';
import { OpeningHours } from '../../../clubs/domain/value-objects/opening-hours.value-object';
import { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { TimeSlot } from '../../../shared/domain/value-objects/time-slot.value-object';
import { BookingWasCancelledEvent } from '../../domain/events/booking-was-cancelled.event';
import { CourtWasBookedEvent } from '../../domain/events/court-was-booked.event';
import { BookingId } from '../../domain/value-objects/booking-id.value-object';
import { UserId } from '../../domain/value-objects/user-id.value-object';
import { DrizzleCourtDayRepository } from '../persistence/drizzle-court-day.repository';
import { MongoCourtDayFinder } from './mongo-court-day.finder';
import { MongoMyBookingsFinder } from './mongo-my-bookings.finder';
import { MongoReadModelProjector } from './mongo-read-model.projector';
import { rebuildReadModel } from './rebuild-read-model';

const { db, close } = testDatabase();
let mongo: Awaited<ReturnType<typeof testMongo>>;
let projector: MongoReadModelProjector;
let days: MongoCourtDayFinder;
let myBookings: MongoMyBookingsFinder;

beforeAll(async () => {
  mongo = await testMongo();
  projector = new MongoReadModelProjector(mongo.mongo);
  days = new MongoCourtDayFinder(mongo.mongo);
  myBookings = new MongoMyBookingsFinder(mongo.mongo);
});
afterAll(async () => {
  await mongo.close();
  await close();
});

const now = new Date();
const date = CalendarDate.parse('2099-01-10');
const ana = UserId.of('ana@padel.local');
const at = (text: string) => TimeSlot.startingAt(TimeOfDay.parse(text));

const opened = (courtId: number) =>
  new CourtWasOpenedEvent(
    CourtId.of(courtId),
    ClubId.of(1),
    CourtName.of('Pista 1'),
    ClubName.of('Club Norte'),
    OpeningHours.of(TimeOfDay.parse('09:00'), TimeOfDay.parse('15:00')),
    now,
  );
const booked = (bookingId: number, courtId: number, start: string, by = ana) =>
  new CourtWasBookedEvent(BookingId.of(bookingId), CourtId.of(courtId), by, date, at(start), now);
const cancelled = (bookingId: number, courtId: number, start: string, by = ana) =>
  new BookingWasCancelledEvent(BookingId.of(bookingId), CourtId.of(courtId), by, date, at(start), now);

describe('el modelo de lectura en Mongo', () => {
  it('una pista abierta tiene su horario y ninguna franja reservada', async () => {
    await projector.courtWasOpened(opened(101));

    expect(await days.find(CourtId.of(101), date)).toEqual({ opens: '09:00', closes: '15:00', bookedStarts: [] });
    expect(await days.find(CourtId.of(999), date)).toBeUndefined();
  });

  it('una reserva ocupa su franja y sale en mis reservas, con los nombres', async () => {
    await projector.courtWasOpened(opened(102));
    const user = UserId.of('luis@padel.local');

    await projector.courtWasBooked(booked(1, 102, '10:30', user));

    expect((await days.find(CourtId.of(102), date))?.bookedStarts).toEqual(['10:30']);
    expect(await myBookings.ofUser(user)).toEqual([
      {
        id: 1,
        courtId: 102,
        userId: 'luis@padel.local',
        date: '2099-01-10',
        start: '10:30',
        end: '12:00',
        courtName: 'Pista 1',
        clubName: 'Club Norte',
      },
    ]);
  });

  it('el mismo evento dos veces deja lo mismo que una', async () => {
    await projector.courtWasOpened(opened(103));
    const user = UserId.of('eva@padel.local');

    await projector.courtWasBooked(booked(2, 103, '10:30', user));
    await projector.courtWasBooked(booked(2, 103, '10:30', user));

    expect((await days.find(CourtId.of(103), date))?.bookedStarts).toEqual(['10:30']);
    expect(await myBookings.ofUser(user)).toHaveLength(1);
  });

  it('una cancelada libera su franja y sale de mis reservas', async () => {
    await projector.courtWasOpened(opened(104));
    const user = UserId.of('pepe@padel.local');
    await projector.courtWasBooked(booked(3, 104, '10:30', user));

    await projector.bookingWasCancelled(cancelled(3, 104, '10:30', user));

    expect((await days.find(CourtId.of(104), date))?.bookedStarts).toEqual([]);
    expect(await myBookings.ofUser(user)).toEqual([]);
  });

  it('mis reservas: solo las del usuario, por fecha y hora', async () => {
    await projector.courtWasOpened(opened(105));
    const user = UserId.of('rosa@padel.local');
    await projector.courtWasBooked(booked(4, 105, '12:00', user));
    await projector.courtWasBooked(booked(5, 105, '09:00', user));
    await projector.courtWasBooked(booked(6, 105, '13:30'));

    expect((await myBookings.ofUser(user)).map((b) => b.start)).toEqual(['09:00', '12:00']);
  });

  // El ultimo: reconstruir tira lo que hayan dejado los demas.
  it('se rehace entero desde Postgres, solo con las reservas activas', async () => {
    const given = seed(db);
    const court = await given.court(await given.club('Club Sur'), { name: 'Central' });
    const active = await given.booking(court, ana, '2099-04-01', '10:30');
    const gone = await given.booking(court, ana, '2099-04-01', '12:00');
    const courtDays = new DrizzleCourtDayRepository(db);
    const day = (await courtDays.loadContaining(gone.id))!;
    day.cancel(gone.id, ana, new Date('2026-01-01'));
    await courtDays.save(day);

    await rebuildReadModel(db, projector);

    const rebuilt = await days.find(court.id, CalendarDate.parse('2099-04-01'));
    expect(rebuilt?.bookedStarts).toEqual(['10:30']);
    const mine = await myBookings.ofUser(ana);
    expect(mine).toContainEqual(
      expect.objectContaining({ id: active.id.toNumber(), courtName: 'Central', clubName: 'Club Sur' }),
    );
    expect(mine.find((b) => b.id === gone.id.toNumber())).toBeUndefined();
    expect(await days.find(CourtId.of(101), date)).toBeUndefined();
  });
});
