import { Injectable } from '@nestjs/common';
import { Court } from '../domain/entities/court.entity';
import { ClubNotFound } from '../domain/errors/club.errors';
import { ClubRepository } from '../domain/repositories/club.repository';
import { CourtRepository } from '../domain/repositories/court.repository';
import type { ClubId } from '../domain/value-objects/club-id.value-object';
import type { CourtName } from '../domain/value-objects/court-name.value-object';
import type { OpeningHours } from '../domain/value-objects/opening-hours.value-object';

@Injectable()
export class OpenCourt {
  constructor(
    private readonly clubs: ClubRepository,
    private readonly courts: CourtRepository,
  ) {}

  async execute(clubId: ClubId, name: CourtName, openingHours: OpeningHours): Promise<Court> {
    const club = await this.clubs.findById(clubId);
    if (!club) throw new ClubNotFound();

    const court = Court.open(await this.courts.nextId(), club, name, openingHours);
    await this.courts.save(court);
    console.log('pista creada', court.id.toNumber());
    return court;
  }
}
