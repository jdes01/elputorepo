import { Injectable } from '@nestjs/common';
import { CourtsFinder, type CourtView } from './courts.finder';
import type { ListCourtsQuery } from './list-courts.query';

@Injectable()
export class ListCourtsHandler {
  constructor(private readonly finder: CourtsFinder) {}

  execute({ clubId }: ListCourtsQuery): Promise<CourtView[]> {
    return this.finder.ofClub(clubId);
  }
}
