import { Module } from '@nestjs/common';
import { ClubRepository } from './club.repository';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';
import { CourtRepository } from './court.repository';
import { DrizzleClubRepository } from './drizzle-club.repository';
import { DrizzleCourtRepository } from './drizzle-court.repository';

@Module({
  controllers: [ClubsController],
  providers: [
    ClubsService,
    { provide: ClubRepository, useClass: DrizzleClubRepository },
    { provide: CourtRepository, useClass: DrizzleCourtRepository },
  ],
  // Las reservas necesitan pistas y clubs: piden los puertos, no las tablas.
  exports: [ClubRepository, CourtRepository],
})
export class ClubsModule {}
