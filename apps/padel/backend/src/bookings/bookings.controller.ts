import { Body, Controller, Delete, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { bookCourt, cancelBooking, getAvailability } from '@padel/contracts';
import type { z } from 'zod';
import { ZodPipe } from '../zod.pipe';
import type { Booking, Slot } from './booking.model';
import { BookingsService } from './bookings.service';

@Controller()
export class BookingsController {
  constructor(private readonly service: BookingsService) {}

  @Get('courts/:courtId/availability')
  availability(
    @Param(new ZodPipe(getAvailability.params)) { courtId }: z.output<typeof getAvailability.params>,
    @Query(new ZodPipe(getAvailability.query)) { date }: z.output<typeof getAvailability.query>,
  ): Promise<Slot[]> {
    return this.service.availability(courtId, date);
  }

  @Post('bookings')
  book(
    @Headers('x-user-id') userId: string,
    @Body(new ZodPipe(bookCourt.body)) body: z.output<typeof bookCourt.body>,
  ): Promise<Booking> {
    return this.service.book(userId, body.courtId, body.date, body.start);
  }

  @Delete('bookings/:id')
  async cancel(
    @Headers('x-user-id') userId: string,
    @Param(new ZodPipe(cancelBooking.params)) { id }: z.output<typeof cancelBooking.params>,
  ): Promise<{ ok: true }> {
    await this.service.cancel(userId, id);
    return { ok: true };
  }

  @Get('me/bookings')
  myBookings(@Headers('x-user-id') userId: string): Promise<Booking[]> {
    return this.service.myBookings(userId);
  }
}
