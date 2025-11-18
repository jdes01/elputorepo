import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventRepository } from '../../domain/repositories/event.repository';
import { Event } from '../../domain/entities/event';
import { EventId } from '../../domain/value-objects/event-id';
import { err, ok, Result } from 'neverthrow';

@Injectable()
export class PrismaEventRepository extends EventRepository {
  private readonly logger = new Logger(PrismaEventRepository.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(event: Event): Promise<Result<void, Error>> {
    try {
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
      return ok()
    } catch (error) {
      return err(error as Error)
    }
  }

  async delete(eventId: EventId): Promise<Result<void, Error>> {
    try {
      await this.prisma.eventProjection.delete({
        where: { id: eventId.value }
      })
      this.logger.log(`Event deleted: ${eventId.value}`);
      return ok()
    } catch (error) {
      this.logger.warn(`Event not found for deletion: ${eventId.value}`);
      return err(error as Error)
    }
  }

  async findById(eventId: EventId): Promise<Result<Event | null, Error>> {
    try {
      const result = await this.prisma.eventProjection.findUnique({
        where: { id: eventId.value },
      });
      if (!result) {
        return ok(null);
      }
      const ticketsSold = await this.prisma.ticket.count({
        where: { eventId: eventId.value },
      });
      
      const availableTickets = result.capacity - ticketsSold;
      
      const event = Event.fromPrimitives({
        id: result.id,
        capacity: result.capacity,
        availableTickets,
      });

      return ok(event)
    } catch (error) {
      this.logger.warn(`Error fetching event ${eventId.value}`);
      return err(error as Error)
    }
  }
}

