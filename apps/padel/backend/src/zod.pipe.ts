import { BadRequestException, type PipeTransform } from '@nestjs/common';
import { z } from 'zod';

// La frontera: lo que entra por HTTP se valida contra el schema del contrato
// ANTES de llegar al controlador. Lo que pasa ya tiene la forma y el tipo
// correctos; lo que no, es un 400 que dice que esta mal.
export class ZodPipe<TSchema extends z.ZodType> implements PipeTransform<unknown, z.output<TSchema>> {
  constructor(private readonly schema: TSchema) {}

  transform(value: unknown): z.output<TSchema> {
    const result = this.schema.safeParse(value);
    if (!result.success) throw new BadRequestException(z.prettifyError(result.error));
    return result.data;
  }
}
