import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  type Club as ClubResponse,
  type Court as CourtResponse,
  createClub,
  createCourt,
  listCourts,
} from '@padel/contracts';
import type { z } from 'zod';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { ZodPipe } from '../../../shared/infrastructure/zod.pipe';
import type { Club } from '../../domain/entities/club.entity';
import type { Court } from '../../domain/entities/court.entity';
import { ListClubs } from '../../application/list-clubs.use-case';
import { ListCourts } from '../../application/list-courts.use-case';
import { OpenCourt } from '../../application/open-court.use-case';
import { RegisterClub } from '../../application/register-club.use-case';
import { ClubId } from '../../domain/value-objects/club-id.value-object';
import { ClubName } from '../../domain/value-objects/club-name.value-object';
import { CourtName } from '../../domain/value-objects/court-name.value-object';
import { OpeningHours } from '../../domain/value-objects/opening-hours.value-object';

@Controller()
export class ClubsController {
  constructor(
    private readonly registerClubUseCase: RegisterClub,
    private readonly listClubsUseCase: ListClubs,
    private readonly openCourtUseCase: OpenCourt,
    private readonly listCourtsUseCase: ListCourts,
  ) {}

  @Post('clubs')
  async createClub(@Body(new ZodPipe(createClub.body)) body: z.output<typeof createClub.body>): Promise<ClubResponse> {
    return toClubResponse(await this.registerClubUseCase.execute(ClubName.of(body.name)));
  }

  @Get('clubs')
  async listClubs(): Promise<ClubResponse[]> {
    return (await this.listClubsUseCase.execute()).map(toClubResponse);
  }

  @Post('clubs/:clubId/courts')
  async createCourt(
    @Param(new ZodPipe(createCourt.params)) { clubId }: z.output<typeof createCourt.params>,
    @Body(new ZodPipe(createCourt.body)) body: z.output<typeof createCourt.body>,
  ): Promise<CourtResponse> {
    const court = await this.openCourtUseCase.execute(
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
    return (await this.listCourtsUseCase.execute(ClubId.of(clubId))).map(toCourtResponse);
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
