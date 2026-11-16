import { Body, Controller, Delete, Get, Headers, Param, Post, Query, UnauthorizedException } from '@nestjs/common';
import {
  type Booking as BookingResponse,
  bookCourt,
  cancelBooking,
  getAvailability,
  type MyBooking as MyBookingResponse,
  type Slot as SlotResponse,
} from '@padel/contracts';
import type { z } from 'zod';
import { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { ZodPipe } from '../../../shared/infrastructure/zod.pipe';
import type { SlotAvailability } from '../../../clubs/domain/entities/court.entity';
import type { Booking } from '../../domain/entities/booking.entity';
import { BookCourt } from '../../application/book-court.use-case';
import { CancelBooking } from '../../application/cancel-booking.use-case';
import { GetAvailability } from '../../application/get-availability.use-case';
import { ListMyBookings } from '../../application/list-my-bookings.use-case';
import { BookingId } from '../../domain/value-objects/booking-id.value-object';
import { UserId } from '../../domain/value-objects/user-id.value-object';

@Controller()
export class BookingsController {
  constructor(
    private readonly bookCourtUseCase: BookCourt,
    private readonly cancelBookingUseCase: CancelBooking,
    private readonly getAvailabilityUseCase: GetAvailability,
    private readonly listMyBookingsUseCase: ListMyBookings,
  ) {}

  @Get('courts/:courtId/availability')
  async availability(
    @Param(new ZodPipe(getAvailability.params)) { courtId }: z.output<typeof getAvailability.params>,
    @Query(new ZodPipe(getAvailability.query)) { date }: z.output<typeof getAvailability.query>,
  ): Promise<SlotResponse[]> {
    return (await this.getAvailabilityUseCase.execute(CourtId.of(courtId), CalendarDate.parse(date))).map(
      toSlotResponse,
    );
  }

  @Post('bookings')
  async book(
    @Headers('x-user-id') userId: string | undefined,
    @Body(new ZodPipe(bookCourt.body)) body: z.output<typeof bookCourt.body>,
  ): Promise<BookingResponse> {
    const booking = await this.bookCourtUseCase.execute(
      userIdFrom(userId),
      CourtId.of(body.courtId),
      CalendarDate.parse(body.date),
      TimeOfDay.parse(body.start),
    );
    return toBookingResponse(booking);
  }

  @Delete('bookings/:id')
  async cancel(
    @Headers('x-user-id') userId: string | undefined,
    @Param(new ZodPipe(cancelBooking.params)) { id }: z.output<typeof cancelBooking.params>,
  ): Promise<{ ok: true }> {
    await this.cancelBookingUseCase.execute(userIdFrom(userId), BookingId.of(id));
    return { ok: true };
  }

  @Get('me/bookings')
  async myBookings(@Headers('x-user-id') userId: string | undefined): Promise<MyBookingResponse[]> {
    return (await this.listMyBookingsUseCase.execute(userIdFrom(userId))).map(toMyBookingResponse);
  }
}

function userIdFrom(header: string | undefined): UserId {
  if (!header) throw new UnauthorizedException('falta x-user-id');
  return UserId.of(header);
}

function toBookingResponse(booking: Booking): BookingResponse {
  return {
    id: booking.id.toNumber(),
    court_id: booking.courtId.toNumber(),
    user_id: booking.userId.toString(),
    date: booking.date.toString(),
    start: booking.slot.start.toString(),
    end: booking.slot.end.toString(),
  };
}

function toMyBookingResponse(booking: Booking): MyBookingResponse {
  return {
    id: booking.id.toNumber(),
    court_id: booking.courtId.toNumber(),
    user_id: booking.userId.toString(),
    date: booking.date.toString(),
    start: booking.slot.start.toString(),
    end: booking.slot.end.toString(),
    court_name: booking.courtName!.toString(),
    club_name: booking.clubName!.toString(),
  };
}

function toSlotResponse({ slot, free }: SlotAvailability): SlotResponse {
  return { start: slot.start.toString(), end: slot.end.toString(), free };
}
