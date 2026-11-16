import { Injectable } from '@nestjs/common';
import { Club } from '../../../domain/entities/club.entity';
import { ClubRepository } from '../../../domain/repositories/club.repository';
import type { RegisterClubCommand } from './register-club.command';

@Injectable()
export class RegisterClubHandler {
  constructor(private readonly clubs: ClubRepository) {}

  async execute({ name }: RegisterClubCommand): Promise<Club> {
    const club = Club.register(await this.clubs.nextId(), name);
    await this.clubs.save(club);
    console.log('club creado', club.id.toNumber());
    return club;
  }
}
