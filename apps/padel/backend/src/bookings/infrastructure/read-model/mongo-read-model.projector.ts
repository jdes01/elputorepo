import { Inject, Injectable } from '@nestjs/common';
import type { Db } from 'mongodb';
import type { CourtWasOpenedEvent } from '../../../clubs/domain/events/court-was-opened.event';
import { MONGO } from '../../../shared/infrastructure/mongo.module';
import type { BookingWasCancelledEvent } from '../../domain/events/booking-was-cancelled.event';
import type { CourtWasBookedEvent } from '../../domain/events/court-was-booked.event';
import { courtDayId, readModel } from './read-model';

// Mantiene el modelo de lectura al dia con los eventos. Cada escritura es
// idempotente (upsert, $addToSet, $pull): recibir el mismo evento dos veces deja
// lo mismo que recibirlo una.
@Injectable()
export class MongoReadModelProjector {
  private readonly model;

  constructor(@Inject(MONGO) db: Db) {
    this.model = readModel(db);
  }

  async courtWasOpened(event: CourtWasOpenedEvent): Promise<void> {
    await this.model.courts.replaceOne(
      { _id: event.courtId.toNumber() },
      {
        clubId: event.clubId.toNumber(),
        name: event.courtName.toString(),
        clubName: event.clubName.toString(),
        opens: event.openingHours.opens.toString(),
        closes: event.openingHours.closes.toString(),
      },
      { upsert: true },
    );
  }

  async courtWasBooked(event: CourtWasBookedEvent): Promise<void> {
    const courtId = event.courtId.toNumber();
    const date = event.date.toString();
    const court = await this.model.courts.findOne({ _id: courtId });
    if (!court) throw new Error(`la pista ${courtId} no esta en el modelo de lectura`);

    await this.model.courtDays.updateOne(
      { _id: courtDayId(courtId, date) },
      { $setOnInsert: { courtId, date }, $addToSet: { bookedStarts: event.slot.start.toString() } },
      { upsert: true },
    );
    await this.model.myBookings.replaceOne(
      { _id: event.bookingId.toNumber() },
      {
        userId: event.userId.toString(),
        courtId,
        date,
        start: event.slot.start.toString(),
        end: event.slot.end.toString(),
        courtName: court.name,
        clubName: court.clubName,
      },
      { upsert: true },
    );
  }

  async bookingWasCancelled(event: BookingWasCancelledEvent): Promise<void> {
    await this.model.courtDays.updateOne(
      { _id: courtDayId(event.courtId.toNumber(), event.date.toString()) },
      { $pull: { bookedStarts: event.slot.start.toString() } },
    );
    await this.model.myBookings.deleteOne({ _id: event.bookingId.toNumber() });
  }

  // Para reconstruir desde cero.
  async clear(): Promise<void> {
    await Promise.all([
      this.model.courts.deleteMany({}),
      this.model.courtDays.deleteMany({}),
      this.model.myBookings.deleteMany({}),
    ]);
  }
}
