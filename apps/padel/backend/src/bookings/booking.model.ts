import type { ClubName } from '../clubs/value-objects/club-name.value-object';
import { CourtId } from '../clubs/value-objects/court-id.value-object';
import type { CourtName } from '../clubs/value-objects/court-name.value-object';
import { CalendarDate } from '../shared/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../shared/value-objects/time-of-day.value-object';
import { TimeSlot } from '../shared/value-objects/time-slot.value-object';
import { BookingId } from './value-objects/booking-id.value-object';
import { UserId } from './value-objects/user-id.value-object';

export interface Booking {
  id: BookingId;
  courtId: CourtId;
  userId: UserId;
  date: CalendarDate;
  slot: TimeSlot;
  // Solo en "mis reservas".
  courtName?: CourtName;
  clubName?: ClubName;
}

export interface Slot {
  slot: TimeSlot;
  free: boolean;
}

export interface BookingRow {
  id: number;
  court_id: number;
  user_id: string;
  date: string;
  start: string;
  end: string;
}

export function bookingFromRow(row: BookingRow): Booking {
  return {
    id: BookingId.of(row.id),
    courtId: CourtId.of(row.court_id),
    userId: UserId.of(row.user_id),
    date: CalendarDate.parse(row.date),
    slot: TimeSlot.startingAt(TimeOfDay.parse(row.start)),
  };
}
