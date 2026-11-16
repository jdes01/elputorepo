import { UnauthorizedException } from '@nestjs/common';
import { UserId } from '../../domain/value-objects/user-id.value-object';

export function userIdFrom(header: string | undefined): UserId {
  if (!header) throw new UnauthorizedException('falta x-user-id');
  return UserId.of(header);
}
