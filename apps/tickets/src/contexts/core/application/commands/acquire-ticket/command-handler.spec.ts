/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AcquireTicketCommandHandler } from './command-handler';
import { EventRepository } from '../../../domain/repositories/event.repository';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { TicketRepository } from '../../../domain/repositories/ticket.repository';
import { Event } from '../../../domain/entities/event';
import { User } from '../../../domain/entities/user';
import { EventId } from '../../../domain/value-objects/event-id';
import { UserId } from '../../../domain/value-objects/user-id';
import { AcquireTicketCommand } from './command';

describe('AcquireTicketCommandHandler', () => {
  let handler: AcquireTicketCommandHandler;
  let eventRepository: jest.Mocked<EventRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let ticketRepository: jest.Mocked<TicketRepository>;

  const mockEventId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserId = '123e4567-e89b-12d3-a456-426614174001';

  beforeEach(async () => {
    const eventRepositoryMock = {
      save: jest.fn(),
      delete: jest.fn(),
      findById: jest.fn(),
    };

    const userRepositoryMock = {
      save: jest.fn(),
      findById: jest.fn(),
    };

    const ticketRepositoryMock = {
      save: jest.fn(),
      findByEventIdAndUserId: jest.fn(),
      countByEventId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcquireTicketCommandHandler,
        {
          provide: EventRepository,
          useValue: eventRepositoryMock,
        },
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: TicketRepository,
          useValue: ticketRepositoryMock,
        },
      ],
    }).compile();

    handler = module.get<AcquireTicketCommandHandler>(AcquireTicketCommandHandler);
    eventRepository = module.get(EventRepository);
    userRepository = module.get(UserRepository);
    ticketRepository = module.get(TicketRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    const createCommand = (): AcquireTicketCommand => ({
      eventId: mockEventId,
      userId: mockUserId,
    });

    it('should successfully acquire a ticket', async () => {
      // Arrange
      const command = createCommand();
      const user = User.fromPrimitives({
        id: mockUserId,
        email: 'test@example.com',
      });
      const event = Event.create(new EventId(mockEventId), 100);

      userRepository.findById.mockResolvedValue(user);
      eventRepository.findById.mockResolvedValue(event);
      ticketRepository.save.mockResolvedValue(undefined);
      eventRepository.save.mockResolvedValue(undefined);

      // Act
      const result = await handler.handle(command);

      // Assert
      expect(result).toHaveProperty('ticketId');
      expect(result.ticketId).toBeDefined();
      expect(userRepository.findById).toHaveBeenCalledWith(new UserId(mockUserId));
      expect(eventRepository.findById).toHaveBeenCalledWith(new EventId(mockEventId));
      expect(ticketRepository.save).toHaveBeenCalledTimes(1);
      expect(eventRepository.save).toHaveBeenCalledTimes(1);
      expect(event.availableTickets).toBe(99);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const command = createCommand();
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.handle(command)).rejects.toThrow(NotFoundException);
      await expect(handler.handle(command)).rejects.toThrow(`User not found: ${mockUserId}`);
      expect(userRepository.findById).toHaveBeenCalledWith(new UserId(mockUserId));
      expect(eventRepository.findById).not.toHaveBeenCalled();
      expect(ticketRepository.save).not.toHaveBeenCalled();
      expect(eventRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when event does not exist', async () => {
      // Arrange
      const command = createCommand();
      const user = User.fromPrimitives({
        id: mockUserId,
        email: 'test@example.com',
      });

      userRepository.findById.mockResolvedValue(user);
      eventRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(handler.handle(command)).rejects.toThrow(NotFoundException);
      await expect(handler.handle(command)).rejects.toThrow(`Event not found: ${mockEventId}`);
      expect(userRepository.findById).toHaveBeenCalledWith(new UserId(mockUserId));
      expect(eventRepository.findById).toHaveBeenCalledWith(new EventId(mockEventId));
      expect(ticketRepository.save).not.toHaveBeenCalled();
      expect(eventRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when no tickets are available', async () => {
      // Arrange
      const command = createCommand();
      const user = User.fromPrimitives({
        id: mockUserId,
        email: 'test@example.com',
      });
      const event = Event.fromPrimitives({
        id: mockEventId,
        capacity: 100,
        availableTickets: 0,
      });

      userRepository.findById.mockResolvedValue(user);
      eventRepository.findById.mockResolvedValue(event);

      // Act & Assert
      await expect(handler.handle(command)).rejects.toThrow(BadRequestException);
      await expect(handler.handle(command)).rejects.toThrow(`No available tickets for event ${mockEventId}`);
      expect(userRepository.findById).toHaveBeenCalledWith(new UserId(mockUserId));
      expect(eventRepository.findById).toHaveBeenCalledWith(new EventId(mockEventId));
      expect(ticketRepository.save).not.toHaveBeenCalled();
      expect(eventRepository.save).not.toHaveBeenCalled();
    });

    it('should reserve tickets and update event availability', async () => {
      // Arrange
      const command = createCommand();
      const user = User.fromPrimitives({
        id: mockUserId,
        email: 'test@example.com',
      });
      const event = Event.fromPrimitives({
        id: mockEventId,
        capacity: 50,
        availableTickets: 10,
      });

      const initialAvailableTickets = event.availableTickets;

      userRepository.findById.mockResolvedValue(user);
      eventRepository.findById.mockResolvedValue(event);
      ticketRepository.save.mockResolvedValue(undefined);
      eventRepository.save.mockResolvedValue(undefined);

      // Act
      await handler.handle(command);

      // Assert
      expect(event.availableTickets).toBe(initialAvailableTickets - 1);
      expect(eventRepository.save).toHaveBeenCalledWith(event);
    });

    it('should create ticket with correct eventId and userId', async () => {
      // Arrange
      const command = createCommand();
      const user = User.fromPrimitives({
        id: mockUserId,
        email: 'test@example.com',
      });
      const event = Event.create(new EventId(mockEventId), 100);

      userRepository.findById.mockResolvedValue(user);
      eventRepository.findById.mockResolvedValue(event);
      ticketRepository.save.mockResolvedValue(undefined);
      eventRepository.save.mockResolvedValue(undefined);

      // Act
      await handler.handle(command);

      // Assert
      expect(ticketRepository.save).toHaveBeenCalledTimes(1);
      const savedTicket = ticketRepository.save.mock.calls[0][0];
      expect(savedTicket.eventId.value).toBe(mockEventId);
      expect(savedTicket.userId.value).toBe(mockUserId);
      expect(savedTicket.id).toBeDefined();
      expect(savedTicket.createdAt).toBeInstanceOf(Date);
    });
  });
});

