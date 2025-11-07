import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventRepository } from '../../../domain/repositories/event.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TicketRepository } from '../../../domain/repositories/ticket.repository';
import { Event } from '../../../domain/entities/event';
import { Ticket } from '../../../domain/entities/ticket';
import { EventId } from '../../../domain/value-objects/event-id';
import { UserId } from '../../../domain/value-objects/user-id';
import { AcquireTicketCommand } from './command';

@Injectable()
export class AcquireTicketCommandHandler {
  private readonly logger = new Logger(AcquireTicketCommandHandler.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly userRepository: UserRepository,
    private readonly ticketRepository: TicketRepository,
  ) {}

  async handle(command: AcquireTicketCommand): Promise<{ ticketId: string }> {
    const eventId = new EventId(command.eventId);
    const userId = new UserId(command.userId);

    // Validate user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.warn(`User not found: ${userId.value}`);
      throw new NotFoundException(`User not found: ${userId.value}`);
    }

    // Validate event exists
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      this.logger.warn(`Event not found: ${eventId.value}`);
      throw new NotFoundException(`Event not found: ${eventId.value}`);
    }

    // Validate availability
    if (!event.hasAvailableTickets(1)) {
      this.logger.warn(`No available tickets for event ${eventId.value}. Available: ${event.availableTickets}`);
      throw new BadRequestException(`No available tickets for event ${eventId.value}`);
    }

    // Reserve ticket
    event.reserveTickets(1);

    // Create ticket
    const ticket = Ticket.create(eventId, userId);

    // Save ticket
    await this.ticketRepository.save(ticket);

    // Update event with new available tickets count
    await this.eventRepository.save(event);

    this.logger.log(`Ticket acquired: ${ticket.id.value} for event ${eventId.value} and user ${userId.value}`);

    return { ticketId: ticket.id.value };
  }
}

