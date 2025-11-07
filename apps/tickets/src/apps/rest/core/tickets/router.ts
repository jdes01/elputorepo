import { Injectable } from '@nestjs/common';
import { TicketsController } from './acquire_ticket/controller';

@Injectable()
export class TicketsRouter {
  constructor(
    private readonly ticketsController: TicketsController,
  ) {}

  // In NestJS, controllers handle routing automatically
  // This is just for consistency with the API structure
}

