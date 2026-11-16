import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { createClub, createCourt, listCourts } from '@padel/contracts';
import type { z } from 'zod';
import { ZodPipe } from '../zod.pipe';
import type { Club, Court } from './club.model';
import { ClubsService } from './clubs.service';

@Controller()
export class ClubsController {
  constructor(private readonly service: ClubsService) {}

  @Post('clubs')
  createClub(@Body(new ZodPipe(createClub.body)) body: z.output<typeof createClub.body>): Promise<Club> {
    return this.service.createClub(body.name);
  }

  @Get('clubs')
  listClubs(): Promise<Club[]> {
    return this.service.listClubs();
  }

  @Post('clubs/:clubId/courts')
  createCourt(
    @Param(new ZodPipe(createCourt.params)) { clubId }: z.output<typeof createCourt.params>,
    @Body(new ZodPipe(createCourt.body)) body: z.output<typeof createCourt.body>,
  ): Promise<Court> {
    return this.service.createCourt(clubId, body.name, body.opens, body.closes);
  }

  @Get('clubs/:clubId/courts')
  listCourts(@Param(new ZodPipe(listCourts.params)) { clubId }: z.output<typeof listCourts.params>): Promise<Court[]> {
    return this.service.listCourts(clubId);
  }
}
