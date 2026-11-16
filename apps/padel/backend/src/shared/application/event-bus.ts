import type { DomainEvent } from '../domain/events/domain-event';

// Lo que reacciona a un evento. Un evento puede tener varios, y quien lo publica
// no sabe cuantos ni cuales.
export interface EventHandler<E extends DomainEvent> {
  handle(event: E): Promise<void>;
}

export abstract class EventBus {
  abstract publish(event: DomainEvent): Promise<void>;
}
