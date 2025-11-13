import { TicketId } from '../ticket-id';

describe('TicketId', () => {
  describe('constructor', () => {
    it('should create a valid ticket id', () => {
      const value = 'test-id';
      const ticketId = new TicketId(value);
      expect(ticketId.value).toBe(value);
    });

    it('should throw error if value is empty', () => {
      expect(() => new TicketId('')).toThrow('Ticket ID cannot be empty');
    });
  });
});
