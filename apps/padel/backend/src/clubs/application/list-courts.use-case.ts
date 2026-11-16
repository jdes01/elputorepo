import { Injectable } from '@nestjs/common';
import type { Court } from '../domain/entities/court.entity';
import { CourtRepository } from '../domain/repositories/court.repository';
import type { ClubId } from '../domain/value-objects/club-id.value-object';

@Injectable()
export class ListCourts {
  constructor(private readonly courts: CourtRepository) {}

  execute(clubId: ClubId): Promise<Court[]> {
    return this.courts.findByClub(clubId);
  }
}
