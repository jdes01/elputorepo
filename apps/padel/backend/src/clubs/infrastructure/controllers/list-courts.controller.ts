import { Controller, Get, Param } from '@nestjs/common';
import { type Court as CourtResponse, listCourts } from '@padel/contracts';
import type { z } from 'zod';
import { ZodPipe } from '../../../shared/infrastructure/zod.pipe';
import { ListCourtsHandler } from '../../application/queries/list-courts/list-courts.handler';
import { ListCourtsQuery } from '../../application/queries/list-courts/list-courts.query';
import { ClubId } from '../../domain/value-objects/club-id.value-object';

@Controller()
export class ListCourtsController {
  constructor(private readonly handler: ListCourtsHandler) {}

  @Get('clubs/:clubId/courts')
  async handle(
    @Param(new ZodPipe(listCourts.params)) { clubId }: z.output<typeof listCourts.params>,
  ): Promise<CourtResponse[]> {
    const courts = await this.handler.execute(new ListCourtsQuery(ClubId.of(clubId)));
    return courts.map((c) => ({ id: c.id, club_id: c.clubId, name: c.name, opens: c.opens, closes: c.closes }));
  }
}
