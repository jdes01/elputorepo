import { Injectable, Logger } from '@nestjs/common';
import { Club } from '../../../domain/entities/club.entity';
import { ClubRepository } from '../../../domain/repositories/club.repository';
import type { RegisterClubCommand } from './register-club.command';

@Injectable()
export class RegisterClubHandler {
  private readonly logger = new Logger(RegisterClubHandler.name);

  constructor(private readonly clubs: ClubRepository) {}

  async execute({ name }: RegisterClubCommand): Promise<Club> {
    const club = Club.register(await this.clubs.nextId(), name);
    await this.clubs.save(club);
    this.logger.log({ clubId: club.id.toNumber() }, 'club creado');
    return club;
  }
}
