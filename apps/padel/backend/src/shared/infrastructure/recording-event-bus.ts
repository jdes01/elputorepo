import { EventBus } from '../application/event-bus';
import type { DomainEvent } from '../domain/events/domain-event';

// El mismo puerto, sin entregar nada a nadie: apunta lo publicado. Para tests.
export class RecordingEventBus extends EventBus {
  readonly published: DomainEvent[] = [];

  async publish(event: DomainEvent): Promise<void> {
    this.published.push(event);
  }
}
