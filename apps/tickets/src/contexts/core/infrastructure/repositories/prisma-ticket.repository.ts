import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TicketRepository } from '../../domain/repositories/ticket.repository';
import { Ticket } from '../../domain/entities/ticket';
import { EventId } from '../../domain/value-objects/event-id';
import { UserId } from '../../domain/value-objects/user-id';

@Injectable()
export class PrismaTicketRepository extends TicketRepository {
  private readonly logger = new Logger(PrismaTicketRepository.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(ticket: Ticket): Promise<void> {
    await this.prisma.ticket.create({
      data: {
        id: ticket.id.value,
        eventId: ticket.eventId.value,
        userId: ticket.userId.value,
        createdAt: ticket.createdAt,
      },
    });
    this.logger.log(
      `Ticket saved: ${ticket.id.value} for event ${ticket.eventId.value} and user ${ticket.userId.value}`,
    );
  }

  async findByEventIdAndUserId(eventId: EventId, userId: UserId): Promise<Ticket[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: {
        eventId: eventId.value,
        userId: userId.value,
      },
    });

    return tickets.map((t) =>
      Ticket.fromPrimitives({
        id: t.id,
        eventId: t.eventId,
        userId: t.userId,
        createdAt: t.createdAt,
      }),
    );
  }

  async countByEventId(eventId: EventId): Promise<number> {
    return this.prisma.ticket.count({
      where: {
        eventId: eventId.value,
      },
    });
  }
}
