import { Body, Controller, Headers, Post } from '@nestjs/common';
import { type Booking as BookingResponse, bookCourt } from '@padel/contracts';
import type { z } from 'zod';
import { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { ZodPipe } from '../../../shared/infrastructure/zod.pipe';
import { BookCourtCommand } from '../../application/commands/book-court/book-court.command';
import { BookCourtHandler } from '../../application/commands/book-court/book-court.handler';
import { userIdFrom } from './user-id-from';

@Controller()
export class BookCourtController {
  constructor(private readonly handler: BookCourtHandler) {}

  @Post('bookings')
  async handle(
    @Headers('x-user-id') userId: string | undefined,
    @Body(new ZodPipe(bookCourt.body)) body: z.output<typeof bookCourt.body>,
  ): Promise<BookingResponse> {
    const booking = await this.handler.execute(
      new BookCourtCommand(
        userIdFrom(userId),
        CourtId.of(body.courtId),
        CalendarDate.parse(body.date),
        TimeOfDay.parse(body.start),
      ),
    );
    return {
      id: booking.id.toNumber(),
      court_id: booking.courtId.toNumber(),
      user_id: booking.userId.toString(),
      date: booking.date.toString(),
      start: booking.slot.start.toString(),
      end: booking.slot.end.toString(),
    };
  }
}
