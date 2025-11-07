import { EventId } from '../value-objects/event-id';
import { UserId } from '../value-objects/user-id';

export interface EventPrimitives {
  id: string;
  capacity: number;
  availableTickets: number;
}

export class Event {
  constructor(
    public readonly id: EventId,
    public readonly capacity: number,
    private _availableTickets: number,
  ) {
    if (capacity <= 0) {
      throw new Error('Event capacity must be greater than 0');
    }
    if (_availableTickets < 0 || _availableTickets > capacity) {
      throw new Error('Available tickets must be between 0 and capacity');
    }
  }

  static create(id: EventId, capacity: number): Event {
    return new Event(id, capacity, capacity);
  }

  static fromPrimitives(data: EventPrimitives): Event {
    return new Event(
      new EventId(data.id),
      data.capacity,
      data.availableTickets,
    );
  }

  get availableTickets(): number {
    return this._availableTickets;
  }

  hasAvailableTickets(quantity: number): boolean {
    return this._availableTickets >= quantity;
  }

  reserveTickets(quantity: number): void {
    if (!this.hasAvailableTickets(quantity)) {
      throw new Error(`Not enough available tickets. Available: ${this._availableTickets}, Requested: ${quantity}`);
    }
    this._availableTickets -= quantity;
  }

  toPrimitives(): EventPrimitives {
    return {
      id: this.id.value,
      capacity: this.capacity,
      availableTickets: this._availableTickets,
    };
  }
}

