import { Injectable } from '@nestjs/common';
import { CourtNotFound } from '../../../../clubs/domain/errors/club.errors';
import { OpeningHours } from '../../../../clubs/domain/value-objects/opening-hours.value-object';
import { TimeOfDay } from '../../../../shared/domain/value-objects/time-of-day.value-object';
import { TimeSlot } from '../../../../shared/domain/value-objects/time-slot.value-object';
import { CourtDayFinder } from './court-day.finder';
import type { GetAvailabilityQuery } from './get-availability.query';

export interface SlotView {
  start: string;
  end: string;
  free: boolean;
}

@Injectable()
export class GetAvailabilityHandler {
  constructor(private readonly finder: CourtDayFinder) {}

  // La lectura no carga entidades, pero si usa los value objects: la rejilla se
  // calcula igual al reservar que al consultar.
  async execute({ courtId, date }: GetAvailabilityQuery): Promise<SlotView[]> {
    const day = await this.finder.find(courtId, date);
    if (!day) throw new CourtNotFound();

    const hours = OpeningHours.of(TimeOfDay.parse(day.opens), TimeOfDay.parse(day.closes));
    const taken = day.bookedStarts.map((start) => TimeSlot.startingAt(TimeOfDay.parse(start)));
    return hours.availability(taken).map(({ slot, free }) => ({
      start: slot.start.toString(),
      end: slot.end.toString(),
      free,
    }));
  }
}
