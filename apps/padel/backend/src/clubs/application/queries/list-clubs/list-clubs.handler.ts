import { Injectable } from '@nestjs/common';
import { ClubsFinder, type ClubView } from './clubs.finder';

@Injectable()
export class ListClubsHandler {
  constructor(private readonly finder: ClubsFinder) {}

  execute(): Promise<ClubView[]> {
    return this.finder.all();
  }
}
