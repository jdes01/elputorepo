import { Controller, Delete, Headers, Param } from '@nestjs/common';
import { cancelBooking } from '@padel/contracts';
import type { z } from 'zod';
import { ZodPipe } from '../../../shared/infrastructure/zod.pipe';
import { CancelBookingCommand } from '../../application/commands/cancel-booking/cancel-booking.command';
import { CancelBookingHandler } from '../../application/commands/cancel-booking/cancel-booking.handler';
import { BookingId } from '../../domain/value-objects/booking-id.value-object';
import { userIdFrom } from './user-id-from';

@Controller()
export class CancelBookingController {
  constructor(private readonly handler: CancelBookingHandler) {}

  @Delete('bookings/:id')
  async handle(
    @Headers('x-user-id') userId: string | undefined,
    @Param(new ZodPipe(cancelBooking.params)) { id }: z.output<typeof cancelBooking.params>,
  ): Promise<{ ok: true }> {
    await this.handler.execute(new CancelBookingCommand(userIdFrom(userId), BookingId.of(id)));
    return { ok: true };
  }
}
