import { Inject, Injectable } from '@nestjs/common';
import type { Db } from 'mongodb';
import { MONGO } from '../../../shared/infrastructure/mongo.module';
import { MyBookingsFinder, type MyBookingView } from '../../application/queries/list-my-bookings/my-bookings.finder';
import type { UserId } from '../../domain/value-objects/user-id.value-object';
import { readModel } from './read-model';

@Injectable()
export class MongoMyBookingsFinder extends MyBookingsFinder {
  private readonly model;

  constructor(@Inject(MONGO) db: Db) {
    super();
    this.model = readModel(db);
  }

  // Un documento por reserva, ya con los nombres: ni JOIN ni consultas de mas.
  async ofUser(userId: UserId): Promise<MyBookingView[]> {
    const docs = await this.model.myBookings.find({ userId: userId.toString() }).sort({ date: 1, start: 1 }).toArray();
    return docs.map((doc) => ({
      id: doc._id,
      courtId: doc.courtId,
      userId: doc.userId,
      date: doc.date,
      start: doc.start,
      end: doc.end,
      courtName: doc.courtName,
      clubName: doc.clubName,
    }));
  }
}
