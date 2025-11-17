import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AcquireTicketCommandHandler } from '@contexts/core/application/commands/acquire-ticket/command-handler';

import { AcquireTicketCommandSchema } from '@contexts/core/application/commands/acquire-ticket/command';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly acquireTicketCommandHandler: AcquireTicketCommandHandler,
  ) {}

  @Post('acquire')
  @HttpCode(HttpStatus.OK)
  async acquireTicket(@Body() body: unknown) {
    const command = AcquireTicketCommandSchema.parse(body);
    const result = await this.acquireTicketCommandHandler.handle(command);
    return {
      message: 'OK',
      data: result,
    };
  }
}

