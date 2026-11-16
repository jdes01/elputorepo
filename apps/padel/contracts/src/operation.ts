import type { z } from 'zod';

/**
 * Una operacion HTTP. Lo que el cliente MANDA (params, query, body) se valida
 * en la frontera del backend; lo que DEVUELVE (response) lo tipa el frontend.
 */
export interface Operation {
  readonly method: 'GET' | 'POST' | 'DELETE';
  readonly path: `/${string}`;
  readonly params?: z.ZodType;
  readonly query?: z.ZodType;
  readonly body?: z.ZodType;
  readonly response: z.ZodType;
}

export type ResponseOf<TOperation extends Operation> = z.output<TOperation['response']>;
