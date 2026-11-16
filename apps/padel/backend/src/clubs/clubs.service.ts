import { Injectable } from '@nestjs/common';
import { Club } from './club.entity';
import { ClubNotFound } from './club.errors';
import { ClubRepository } from './club.repository';
import { Court } from './court.entity';
import { CourtRepository } from './court.repository';
import type { ClubId } from './value-objects/club-id.value-object';
import type { ClubName } from './value-objects/club-name.value-object';
import type { CourtName } from './value-objects/court-name.value-object';
import type { OpeningHours } from './value-objects/opening-hours.value-object';

@Injectable()
export class ClubsService {
  constructor(
    private readonly clubs: ClubRepository,
    private readonly courts: CourtRepository,
  ) {}

  async createClub(name: ClubName): Promise<Club> {
    const club = Club.register(await this.clubs.nextId(), name);
    await this.clubs.save(club);
    console.log('club creado', club.id.toNumber());
    return club;
  }

  listClubs(): Promise<Club[]> {
    return this.clubs.findAll();
  }

  async createCourt(clubId: ClubId, name: CourtName, openingHours: OpeningHours): Promise<Court> {
    const club = await this.clubs.findById(clubId);
    if (!club) throw new ClubNotFound();

    const court = Court.open(await this.courts.nextId(), club, name, openingHours);
    await this.courts.save(court);
    console.log('pista creada', court.id.toNumber());
    return court;
  }

  listCourts(clubId: ClubId): Promise<Court[]> {
    return this.courts.findByClub(clubId);
  }
}
