import { Module } from '@nestjs/common';
import { ClubRepository } from '../domain/repositories/club.repository';
import { ClubsController } from './controllers/clubs.controller';
import { ListClubs } from '../application/list-clubs.use-case';
import { ListCourts } from '../application/list-courts.use-case';
import { OpenCourt } from '../application/open-court.use-case';
import { RegisterClub } from '../application/register-club.use-case';
import { CourtRepository } from '../domain/repositories/court.repository';
import { DrizzleClubRepository } from './persistence/drizzle-club.repository';
import { DrizzleCourtRepository } from './persistence/drizzle-court.repository';

@Module({
  controllers: [ClubsController],
  providers: [
    RegisterClub,
    ListClubs,
    OpenCourt,
    ListCourts,
    { provide: ClubRepository, useClass: DrizzleClubRepository },
    { provide: CourtRepository, useClass: DrizzleCourtRepository },
  ],
  // Las reservas necesitan pistas y clubs: piden los puertos, no las tablas.
  exports: [ClubRepository, CourtRepository],
})
export class ClubsModule {}
