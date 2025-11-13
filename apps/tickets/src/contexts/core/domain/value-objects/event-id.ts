export class EventId {
  constructor(public readonly value: string) {
    if (!value) {
      throw new Error('Event ID cannot be empty');
    }
  }

  equals(other: EventId): boolean {
    return this.value === other.value;
  }
}
