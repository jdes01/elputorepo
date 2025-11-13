export class TicketId {
  constructor(public readonly value: string) {
    if (!value) {
      throw new Error('Ticket ID cannot be empty');
    }
  }

  equals(other: TicketId): boolean {
    return this.value === other.value;
  }

  static generate(): TicketId {
    return new TicketId(crypto.randomUUID());
  }
}
