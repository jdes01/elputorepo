import { Controller, Get, Headers } from '@nestjs/common';
import type { MyBooking as MyBookingResponse } from '@padel/contracts';
import { ListMyBookingsHandler } from '../../application/queries/list-my-bookings/list-my-bookings.handler';
import { ListMyBookingsQuery } from '../../application/queries/list-my-bookings/list-my-bookings.query';
import { userIdFrom } from './user-id-from';

@Controller()
export class ListMyBookingsController {
  constructor(private readonly handler: ListMyBookingsHandler) {}

  @Get('me/bookings')
  async handle(@Headers('x-user-id') userId: string | undefined): Promise<MyBookingResponse[]> {
    const bookings = await this.handler.execute(new ListMyBookingsQuery(userIdFrom(userId)));
    return bookings.map((b) => ({
      id: b.id,
      court_id: b.courtId,
      user_id: b.userId,
      date: b.date,
      start: b.start,
      end: b.end,
      court_name: b.courtName,
      club_name: b.clubName,
    }));
  }
}
