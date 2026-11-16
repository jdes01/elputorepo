import { Test } from '@nestjs/testing';
import { MongoClient } from 'mongodb';
import { Pool } from 'pg';
import { AppModule } from '../src/app.module';
import { CourtDayFinder } from '../src/bookings/application/queries/get-availability/court-day.finder';
import { MyBookingsFinder } from '../src/bookings/application/queries/list-my-bookings/my-bookings.finder';
import { CourtDayRepository } from '../src/bookings/domain/repositories/court-day.repository';
import { InMemoryCourtDayRepository } from '../src/bookings/infrastructure/persistence/in-memory-court-day.repository';
import {
  InMemoryCourtDayFinder,
  InMemoryMyBookingsFinder,
} from '../src/bookings/infrastructure/persistence/in-memory-bookings.finders';
import { ClubsFinder } from '../src/clubs/application/queries/list-clubs/clubs.finder';
import { CourtsFinder } from '../src/clubs/application/queries/list-courts/courts.finder';
import { ClubRepository } from '../src/clubs/domain/repositories/club.repository';
import { CourtRepository } from '../src/clubs/domain/repositories/court.repository';
import { InMemoryClubRepository } from '../src/clubs/infrastructure/persistence/in-memory-club.repository';
import {
  InMemoryClubsFinder,
  InMemoryCourtsFinder,
} from '../src/clubs/infrastructure/persistence/in-memory-clubs.finders';
import { InMemoryCourtRepository } from '../src/clubs/infrastructure/persistence/in-memory-court.repository';
import { configureHttp } from '../src/http';
import { Mailer } from '../src/shared/application/mailer';
import { MongoCourtDayFinder } from '../src/bookings/infrastructure/read-model/mongo-court-day.finder';
import { MongoReadModelProjector } from '../src/bookings/infrastructure/read-model/mongo-read-model.projector';
import { DATABASE } from '../src/shared/infrastructure/database.module';
import { MONGO } from '../src/shared/infrastructure/mongo.module';
import { REDIS } from '../src/shared/infrastructure/redis.module';
import { RecordingMailer } from '../src/shared/infrastructure/recording-mailer';

type Options = { body?: unknown; user?: string };

// La app de verdad (AppModule: controllers, handlers, validacion y filtro de
// errores) con cada puerto en memoria. Sin postgres, sin SMTP, sin docker.
export async function startHttpApp() {
  const clubs = new InMemoryClubRepository();
  const courts = new InMemoryCourtRepository();
  const courtDays = new InMemoryCourtDayRepository(courts);
  const mailer = new RecordingMailer();

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(Pool)
    .useValue({})
    .overrideProvider(DATABASE)
    .useValue({})
    .overrideProvider(MongoClient)
    .useValue({ close: async () => {} })
    .overrideProvider(MONGO)
    .useValue({})
    .overrideProvider(REDIS)
    .useValue({ isOpen: false })
    .overrideProvider(MongoCourtDayFinder)
    .useValue({})
    // La lectura la hacen los finders en memoria: el proyector no tiene nada que hacer.
    .overrideProvider(MongoReadModelProjector)
    .useValue({ courtWasOpened: async () => {}, courtWasBooked: async () => {}, bookingWasCancelled: async () => {} })
    .overrideProvider(Mailer)
    .useValue(mailer)
    .overrideProvider(ClubRepository)
    .useValue(clubs)
    .overrideProvider(CourtRepository)
    .useValue(courts)
    .overrideProvider(CourtDayRepository)
    .useValue(courtDays)
    .overrideProvider(ClubsFinder)
    .useValue(new InMemoryClubsFinder(clubs))
    .overrideProvider(CourtsFinder)
    .useValue(new InMemoryCourtsFinder(courts))
    .overrideProvider(CourtDayFinder)
    .useValue(new InMemoryCourtDayFinder(courts, courtDays))
    .overrideProvider(MyBookingsFinder)
    .useValue(new InMemoryMyBookingsFinder(courtDays, courts, clubs))
    .compile();

  const app = configureHttp(moduleRef.createNestApplication({ logger: false }));
  await app.listen(0);
  const url = await app.getUrl();

  return {
    mailer,
    close: () => app.close(),

    async call(method: string, path: string, { body, user }: Options = {}) {
      const headers: Record<string, string> = {};
      if (body !== undefined) headers['content-type'] = 'application/json';
      if (user !== undefined) headers['x-user-id'] = user;
      const res = await fetch(url + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const text = await res.text();
      return { status: res.status, body: text ? JSON.parse(text) : undefined };
    },
  };
}

export type HttpApp = Awaited<ReturnType<typeof startHttpApp>>;
