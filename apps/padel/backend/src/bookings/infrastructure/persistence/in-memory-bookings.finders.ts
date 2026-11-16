import type { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import type { InMemoryClubRepository } from '../../../clubs/infrastructure/persistence/in-memory-club.repository';
import type { InMemoryCourtRepository } from '../../../clubs/infrastructure/persistence/in-memory-court.repository';
import type { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { CourtDayFinder, type CourtDayView } from '../../application/queries/get-availability/court-day.finder';
import { MyBookingsFinder, type MyBookingView } from '../../application/queries/list-my-bookings/my-bookings.finder';
import type { UserId } from '../../domain/value-objects/user-id.value-object';
import type { InMemoryBookingRepository } from './in-memory-booking.repository';

export class InMemoryCourtDayFinder extends CourtDayFinder {
  constructor(
    private readonly courts: InMemoryCourtRepository,
    private readonly bookings: InMemoryBookingRepository,
  ) {
    super();
  }

  async find(courtId: CourtId, date: CalendarDate): Promise<CourtDayView | undefined> {
    const court = await this.courts.findById(courtId);
    if (!court) return undefined;
    const booked = await this.bookings.findByCourtAndDate(courtId, date);
    return {
      opens: court.openingHours.opens.toString(),
      closes: court.openingHours.closes.toString(),
      bookedStarts: booked.map((b) => b.slot.start.toString()),
    };
  }
}

export class InMemoryMyBookingsFinder extends MyBookingsFinder {
  constructor(
    private readonly bookings: InMemoryBookingRepository,
    private readonly courts: InMemoryCourtRepository,
    private readonly clubs: InMemoryClubRepository,
  ) {
    super();
  }

  async ofUser(userId: UserId): Promise<MyBookingView[]> {
    const mine = this.bookings.all().filter((b) => b.userId.equals(userId));
    const views = mine.map((b) => {
      const court = this.courts.all().find((c) => c.id.equals(b.courtId))!;
      const club = this.clubs.all().find((c) => c.id.equals(court.clubId))!;
      return {
        id: b.id.toNumber(),
        courtId: b.courtId.toNumber(),
        userId: b.userId.toString(),
        date: b.date.toString(),
        start: b.slot.start.toString(),
        end: b.slot.end.toString(),
        courtName: court.name.toString(),
        clubName: club.name.toString(),
      };
    });
    return views.toSorted((a, b) => `${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
  }
}
