import { Injectable } from '@nestjs/common';
import type { Club } from '../domain/entities/club.entity';
import { ClubRepository } from '../domain/repositories/club.repository';

@Injectable()
export class ListClubs {
  constructor(private readonly clubs: ClubRepository) {}

  execute(): Promise<Club[]> {
    return this.clubs.findAll();
  }
}
