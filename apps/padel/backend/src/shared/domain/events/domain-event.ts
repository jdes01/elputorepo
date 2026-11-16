// Algo que ha pasado en el dominio, en pasado: "se ha reservado una pista".
export abstract class DomainEvent {
  constructor(readonly occurredAt: Date) {}
}

export type EventType<E extends DomainEvent> = abstract new (...args: never[]) => E;
