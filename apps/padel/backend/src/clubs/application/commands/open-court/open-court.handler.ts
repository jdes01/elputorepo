import { Injectable } from '@nestjs/common';
import { Court } from '../../../domain/entities/court.entity';
import { ClubNotFound } from '../../../domain/errors/club.errors';
import { ClubRepository } from '../../../domain/repositories/club.repository';
import { CourtRepository } from '../../../domain/repositories/court.repository';
import type { OpenCourtCommand } from './open-court.command';

@Injectable()
export class OpenCourtHandler {
  constructor(
    private readonly clubs: ClubRepository,
    private readonly courts: CourtRepository,
  ) {}

  async execute({ clubId, name, openingHours }: OpenCourtCommand): Promise<Court> {
    const club = await this.clubs.findById(clubId);
    if (!club) throw new ClubNotFound();

    const court = Court.open(await this.courts.nextId(), club, name, openingHours);
    await this.courts.save(court);
    console.log('pista creada', court.id.toNumber());
    return court;
  }
}
