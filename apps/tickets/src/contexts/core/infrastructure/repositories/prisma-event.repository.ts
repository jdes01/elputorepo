import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventRepository } from '../../domain/repositories/event.repository';
import { Event } from '../../domain/entities/event';
import { EventId } from '../../domain/value-objects/event-id';

@Injectable()
export class PrismaEventRepository extends EventRepository {
  private readonly logger = new Logger(PrismaEventRepository.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(event: Event): Promise<void> {
    const primitives = event.toPrimitives();
    await this.prisma.eventProjection.upsert({
      where: { id: primitives.id },
      create: {
        id: primitives.id,
        capacity: primitives.capacity,
      },
      update: {
        capacity: primitives.capacity,
      },
    });
    this.logger.log(`Event saved: ${primitives.id} with capacity ${primitives.capacity}`);
  }

  async delete(eventId: EventId): Promise<void> {
    await this.prisma.eventProjection.delete({
      where: { id: eventId.value },
    }).catch(() => {
      this.logger.warn(`Event not found for deletion: ${eventId.value}`);
    });
    this.logger.log(`Event deleted: ${eventId.value}`);
  }

  async findById(eventId: EventId): Promise<Event | null> {
    const result = await this.prisma.eventProjection.findUnique({
      where: { id: eventId.value },
    });
    
    if (!result) {
      return null;
    }
    
    // Calculate available tickets: capacity - tickets sold
    const ticketsSold = await this.prisma.ticket.count({
      where: { eventId: eventId.value },
    });
    
    const availableTickets = result.capacity - ticketsSold;
    
    return Event.fromPrimitives({
      id: result.id,
      capacity: result.capacity,
      availableTickets,
    });
  }
}

