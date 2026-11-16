import { Test } from '@nestjs/testing';
import { Pool } from 'pg';
import { AppModule } from '../src/app.module';
import { CourtDayFinder } from '../src/bookings/application/queries/get-availability/court-day.finder';
import { MyBookingsFinder } from '../src/bookings/application/queries/list-my-bookings/my-bookings.finder';
import { BookingRepository } from '../src/bookings/domain/repositories/booking.repository';
import { InMemoryBookingRepository } from '../src/bookings/infrastructure/persistence/in-memory-booking.repository';
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
import { DATABASE } from '../src/shared/infrastructure/database.module';
import { RecordingMailer } from '../src/shared/infrastructure/recording-mailer';

type Options = { body?: unknown; user?: string };

// La app de verdad (AppModule: controllers, handlers, validacion y filtro de
// errores) con cada puerto en memoria. Sin postgres, sin SMTP, sin docker.
export async function startHttpApp() {
  const clubs = new InMemoryClubRepository();
  const courts = new InMemoryCourtRepository();
  const bookings = new InMemoryBookingRepository();
  const mailer = new RecordingMailer();

  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(Pool)
    .useValue({})
    .overrideProvider(DATABASE)
    .useValue({})
    .overrideProvider(Mailer)
    .useValue(mailer)
    .overrideProvider(ClubRepository)
    .useValue(clubs)
    .overrideProvider(CourtRepository)
    .useValue(courts)
    .overrideProvider(BookingRepository)
    .useValue(bookings)
    .overrideProvider(ClubsFinder)
    .useValue(new InMemoryClubsFinder(clubs))
    .overrideProvider(CourtsFinder)
    .useValue(new InMemoryCourtsFinder(courts))
    .overrideProvider(CourtDayFinder)
    .useValue(new InMemoryCourtDayFinder(courts, bookings))
    .overrideProvider(MyBookingsFinder)
    .useValue(new InMemoryMyBookingsFinder(bookings, courts, clubs))
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
