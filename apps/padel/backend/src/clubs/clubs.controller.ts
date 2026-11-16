import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  type Club as ClubResponse,
  type Court as CourtResponse,
  createClub,
  createCourt,
  listCourts,
} from '@padel/contracts';
import type { z } from 'zod';
import { TimeOfDay } from '../shared/value-objects/time-of-day.value-object';
import { ZodPipe } from '../zod.pipe';
import type { Club } from './club.entity';
import type { Court } from './court.entity';
import { ClubsService } from './clubs.service';
import { ClubId } from './value-objects/club-id.value-object';
import { ClubName } from './value-objects/club-name.value-object';
import { CourtName } from './value-objects/court-name.value-object';
import { OpeningHours } from './value-objects/opening-hours.value-object';

@Controller()
export class ClubsController {
  constructor(private readonly service: ClubsService) {}

  @Post('clubs')
  async createClub(@Body(new ZodPipe(createClub.body)) body: z.output<typeof createClub.body>): Promise<ClubResponse> {
    return toClubResponse(await this.service.createClub(ClubName.of(body.name)));
  }

  @Get('clubs')
  async listClubs(): Promise<ClubResponse[]> {
    return (await this.service.listClubs()).map(toClubResponse);
  }

  @Post('clubs/:clubId/courts')
  async createCourt(
    @Param(new ZodPipe(createCourt.params)) { clubId }: z.output<typeof createCourt.params>,
    @Body(new ZodPipe(createCourt.body)) body: z.output<typeof createCourt.body>,
  ): Promise<CourtResponse> {
    const court = await this.service.createCourt(
      ClubId.of(clubId),
      CourtName.of(body.name),
      OpeningHours.of(TimeOfDay.parse(body.opens), TimeOfDay.parse(body.closes)),
    );
    return toCourtResponse(court);
  }

  @Get('clubs/:clubId/courts')
  async listCourts(
    @Param(new ZodPipe(listCourts.params)) { clubId }: z.output<typeof listCourts.params>,
  ): Promise<CourtResponse[]> {
    return (await this.service.listCourts(ClubId.of(clubId))).map(toCourtResponse);
  }
}

function toClubResponse(club: Club): ClubResponse {
  return { id: club.id.toNumber(), name: club.name.toString() };
}

function toCourtResponse(court: Court): CourtResponse {
  return {
    id: court.id.toNumber(),
    club_id: court.clubId.toNumber(),
    name: court.name.toString(),
    opens: court.openingHours.opens.toString(),
    closes: court.openingHours.closes.toString(),
  };
}
