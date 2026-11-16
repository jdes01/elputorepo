import { Global, Injectable, Logger, Module } from '@nestjs/common';
import { EventBus, type EventHandler } from '../application/event-bus';
import type { DomainEvent, EventType } from '../domain/events/domain-event';

// El bus mas simple: en el mismo proceso y en la misma peticion. Si un handler
// falla, se apunta en el log y el resto sigue: lo que ya ha pasado (la reserva)
// no se deshace porque falle una reaccion (el correo).
@Injectable()
export class InProcessEventBus extends EventBus {
  private readonly logger = new Logger(InProcessEventBus.name);
  private readonly handlers = new Map<EventType<DomainEvent>, EventHandler<DomainEvent>[]>();

  subscribe<E extends DomainEvent>(type: EventType<E>, handler: EventHandler<E>): void {
    const handlers = this.handlers.get(type) ?? [];
    handlers.push(handler as EventHandler<DomainEvent>);
    this.handlers.set(type, handlers);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.constructor as EventType<DomainEvent>) ?? [];
    await Promise.all(
      handlers.map((handler) =>
        handler.handle(event).catch((error: unknown) => {
          this.logger.error({ err: error }, `${handler.constructor.name} fallo con ${event.constructor.name}`);
        }),
      ),
    );
  }
}

// Un bus para toda la app. Global: los command handlers piden EventBus y los
// modulos suscriben sus event handlers al arrancar.
@Global()
@Module({
  providers: [InProcessEventBus, { provide: EventBus, useExisting: InProcessEventBus }],
  exports: [InProcessEventBus, EventBus],
})
export class EventBusModule {}
