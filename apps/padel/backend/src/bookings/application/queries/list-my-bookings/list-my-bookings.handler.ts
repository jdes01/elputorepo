import { Injectable } from '@nestjs/common';
import type { ListMyBookingsQuery } from './list-my-bookings.query';
import { MyBookingsFinder, type MyBookingView } from './my-bookings.finder';

@Injectable()
export class ListMyBookingsHandler {
  constructor(private readonly finder: MyBookingsFinder) {}

  execute({ userId }: ListMyBookingsQuery): Promise<MyBookingView[]> {
    return this.finder.ofUser(userId);
  }
}
