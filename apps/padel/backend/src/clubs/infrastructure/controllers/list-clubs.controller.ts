import { Controller, Get } from '@nestjs/common';
import type { Club as ClubResponse } from '@padel/contracts';
import { ListClubsHandler } from '../../application/queries/list-clubs/list-clubs.handler';

@Controller()
export class ListClubsController {
  constructor(private readonly handler: ListClubsHandler) {}

  @Get('clubs')
  handle(): Promise<ClubResponse[]> {
    return this.handler.execute();
  }
}
