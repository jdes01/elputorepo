import { type ArgumentsHost, Catch, type ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import { InvalidValueError } from './invalid-value.error';

// Un valor invalido viene de lo que mando el cliente: es un 400.
@Catch(InvalidValueError)
export class InvalidValueFilter implements ExceptionFilter {
  catch(error: InvalidValueError, host: ArgumentsHost) {
    host.switchToHttp().getResponse<Response>().status(400).json({ statusCode: 400, message: error.message });
  }
}
