import { Module } from '@nestjs/common';
import { OpenCourtHandler } from '../application/commands/open-court/open-court.handler';
import { RegisterClubHandler } from '../application/commands/register-club/register-club.handler';
import { ClubsFinder } from '../application/queries/list-clubs/clubs.finder';
import { ListClubsHandler } from '../application/queries/list-clubs/list-clubs.handler';
import { CourtsFinder } from '../application/queries/list-courts/courts.finder';
import { ListCourtsHandler } from '../application/queries/list-courts/list-courts.handler';
import { ClubRepository } from '../domain/repositories/club.repository';
import { CourtRepository } from '../domain/repositories/court.repository';
import { ListClubsController } from './controllers/list-clubs.controller';
import { ListCourtsController } from './controllers/list-courts.controller';
import { OpenCourtController } from './controllers/open-court.controller';
import { RegisterClubController } from './controllers/register-club.controller';
import { DrizzleClubRepository } from './persistence/drizzle-club.repository';
import { DrizzleClubsFinder } from './persistence/drizzle-clubs.finder';
import { DrizzleCourtRepository } from './persistence/drizzle-court.repository';
import { DrizzleCourtsFinder } from './persistence/drizzle-courts.finder';

@Module({
  controllers: [RegisterClubController, OpenCourtController, ListClubsController, ListCourtsController],
  providers: [
    // Escritura: command handlers sobre repositorios.
    RegisterClubHandler,
    OpenCourtHandler,
    { provide: ClubRepository, useClass: DrizzleClubRepository },
    { provide: CourtRepository, useClass: DrizzleCourtRepository },
    // Lectura: query handlers sobre finders.
    ListClubsHandler,
    ListCourtsHandler,
    { provide: ClubsFinder, useClass: DrizzleClubsFinder },
    { provide: CourtsFinder, useClass: DrizzleCourtsFinder },
  ],
  // Las reservas necesitan pistas y clubs: piden los puertos, no las tablas.
  exports: [ClubRepository, CourtRepository],
})
export class ClubsModule {}
