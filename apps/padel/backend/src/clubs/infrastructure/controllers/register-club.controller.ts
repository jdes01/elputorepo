import { Body, Controller, Post } from '@nestjs/common';
import { type Club as ClubResponse, createClub } from '@padel/contracts';
import type { z } from 'zod';
import { ZodPipe } from '../../../shared/infrastructure/zod.pipe';
import { RegisterClubCommand } from '../../application/commands/register-club/register-club.command';
import { RegisterClubHandler } from '../../application/commands/register-club/register-club.handler';
import { ClubName } from '../../domain/value-objects/club-name.value-object';

@Controller()
export class RegisterClubController {
  constructor(private readonly handler: RegisterClubHandler) {}

  @Post('clubs')
  async handle(@Body(new ZodPipe(createClub.body)) body: z.output<typeof createClub.body>): Promise<ClubResponse> {
    const club = await this.handler.execute(new RegisterClubCommand(ClubName.of(body.name)));
    return { id: club.id.toNumber(), name: club.name.toString() };
  }
}
