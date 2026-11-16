import { Body, Controller, Param, Post } from '@nestjs/common';
import { type Court as CourtResponse, createCourt } from '@padel/contracts';
import type { z } from 'zod';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { ZodPipe } from '../../../shared/infrastructure/zod.pipe';
import { OpenCourtCommand } from '../../application/commands/open-court/open-court.command';
import { OpenCourtHandler } from '../../application/commands/open-court/open-court.handler';
import { ClubId } from '../../domain/value-objects/club-id.value-object';
import { CourtName } from '../../domain/value-objects/court-name.value-object';
import { OpeningHours } from '../../domain/value-objects/opening-hours.value-object';

@Controller()
export class OpenCourtController {
  constructor(private readonly handler: OpenCourtHandler) {}

  @Post('clubs/:clubId/courts')
  async handle(
    @Param(new ZodPipe(createCourt.params)) { clubId }: z.output<typeof createCourt.params>,
    @Body(new ZodPipe(createCourt.body)) body: z.output<typeof createCourt.body>,
  ): Promise<CourtResponse> {
    const court = await this.handler.execute(
      new OpenCourtCommand(
        ClubId.of(clubId),
        CourtName.of(body.name),
        OpeningHours.of(TimeOfDay.parse(body.opens), TimeOfDay.parse(body.closes)),
      ),
    );
    return {
      id: court.id.toNumber(),
      club_id: court.clubId.toNumber(),
      name: court.name.toString(),
      opens: court.openingHours.opens.toString(),
      closes: court.openingHours.closes.toString(),
    };
  }
}
