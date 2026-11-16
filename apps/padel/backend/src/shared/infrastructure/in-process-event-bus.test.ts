import { Logger } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { EventHandler } from '../application/event-bus';
import { DomainEvent } from '../domain/events/domain-event';
import { InProcessEventBus } from './in-process-event-bus';

class SomethingWasDoneEvent extends DomainEvent {}
class SomethingElseWasDoneEvent extends DomainEvent {}

class Recorder<E extends DomainEvent> implements EventHandler<E> {
  readonly seen: E[] = [];
  async handle(event: E): Promise<void> {
    this.seen.push(event);
  }
}

describe('InProcessEventBus', () => {
  it('entrega cada evento a todos los handlers de su tipo, y solo a esos', async () => {
    const bus = new InProcessEventBus();
    const first = new Recorder<SomethingWasDoneEvent>();
    const second = new Recorder<SomethingWasDoneEvent>();
    const other = new Recorder<SomethingElseWasDoneEvent>();
    bus.subscribe(SomethingWasDoneEvent, first);
    bus.subscribe(SomethingWasDoneEvent, second);
    bus.subscribe(SomethingElseWasDoneEvent, other);
    const event = new SomethingWasDoneEvent(new Date());

    await bus.publish(event);

    expect(first.seen).toEqual([event]);
    expect(second.seen).toEqual([event]);
    expect(other.seen).toEqual([]);
  });

  it('si un handler falla, los demas reciben el evento y quien publica no se entera', async () => {
    const logged = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    const bus = new InProcessEventBus();
    const healthy = new Recorder<SomethingWasDoneEvent>();
    bus.subscribe(SomethingWasDoneEvent, {
      handle: async () => {
        throw new Error('el servidor de correo no responde');
      },
    });
    bus.subscribe(SomethingWasDoneEvent, healthy);

    await expect(bus.publish(new SomethingWasDoneEvent(new Date()))).resolves.toBeUndefined();
    expect(healthy.seen).toHaveLength(1);
    expect(logged).toHaveBeenCalled();
  });
});
