import { randomUUID } from 'node:crypto';
import type { DestinationStream } from 'pino';
import type { Params } from 'nestjs-pino';

export const REQUEST_ID_HEADER = 'x-request-id';

// Logs en JSON con el id de correlacion de la peticion en cada linea, tambien en
// las de los handlers y el event bus: nestjs-pino guarda el logger de la
// peticion en un AsyncLocalStorage y todo lo que corre dentro lo encuentra.
// El id es el que manda el cliente (X-Request-Id o X-Correlation-Id) o uno nuevo,
// y se devuelve en la respuesta.
export function loggerParams(level: string, stream?: DestinationStream): Params {
  const options: NonNullable<Extract<Params['pinoHttp'], { genReqId?: unknown }>> = {
    level,
    genReqId: (req, res) => {
      const sent = req.headers[REQUEST_ID_HEADER] ?? req.headers['x-correlation-id'];
      const id = typeof sent === 'string' && sent !== '' ? sent : randomUUID();
      res.setHeader(REQUEST_ID_HEADER, id);
      return id;
    },
    // Las lineas de la peticion llevan solo su id, no todas las cabeceras.
    quietReqLogger: true,
    customAttributeKeys: { reqId: 'correlationId' },
  };
  return { pinoHttp: stream ? [options, stream] : options };
}
