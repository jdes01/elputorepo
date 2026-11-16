import type { ClubName } from '../../../domain/value-objects/club-name.value-object';

export class RegisterClubCommand {
  constructor(readonly name: ClubName) {}
}
