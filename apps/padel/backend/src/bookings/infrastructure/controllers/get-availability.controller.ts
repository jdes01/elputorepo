import { Controller, Get, Param, Query } from '@nestjs/common';
import { getAvailability, type Slot as SlotResponse } from '@padel/contracts';
import type { z } from 'zod';
import { CourtId } from '../../../clubs/domain/value-objects/court-id.value-object';
import { CalendarDate } from '../../../shared/domain/value-objects/calendar-date.value-object';
import { ZodPipe } from '../../../shared/infrastructure/zod.pipe';
import { GetAvailabilityHandler } from '../../application/queries/get-availability/get-availability.handler';
import { GetAvailabilityQuery } from '../../application/queries/get-availability/get-availability.query';

@Controller()
export class GetAvailabilityController {
  constructor(private readonly handler: GetAvailabilityHandler) {}

  @Get('courts/:courtId/availability')
  handle(
    @Param(new ZodPipe(getAvailability.params)) { courtId }: z.output<typeof getAvailability.params>,
    @Query(new ZodPipe(getAvailability.query)) { date }: z.output<typeof getAvailability.query>,
  ): Promise<SlotResponse[]> {
    return this.handler.execute(new GetAvailabilityQuery(CourtId.of(courtId), CalendarDate.parse(date)));
  }
}
