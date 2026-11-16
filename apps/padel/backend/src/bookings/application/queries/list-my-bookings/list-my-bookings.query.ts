import type { UserId } from '../../../domain/value-objects/user-id.value-object';

export class ListMyBookingsQuery {
  constructor(readonly userId: UserId) {}
}
