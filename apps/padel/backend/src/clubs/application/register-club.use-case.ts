import { Injectable } from '@nestjs/common';
import { Club } from '../domain/entities/club.entity';
import { ClubRepository } from '../domain/repositories/club.repository';
import type { ClubName } from '../domain/value-objects/club-name.value-object';

@Injectable()
export class RegisterClub {
  constructor(private readonly clubs: ClubRepository) {}

  async execute(name: ClubName): Promise<Club> {
    const club = Club.register(await this.clubs.nextId(), name);
    await this.clubs.save(club);
    console.log('club creado', club.id.toNumber());
    return club;
  }
}
