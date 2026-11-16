import { ExpressInstrumentation, ExpressLayerType } from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { loadConfig } from './config';

// main.ts lo importa el PRIMERO: las instrumentaciones parchean http, express,
// pg, mongodb, redis y pino cuando se cargan, y lo que ya se cargo no se parchea.
//
// Sin OTEL_EXPORTER_OTLP_ENDPOINT no arranca nada y la app va igual. Con ella,
// el SDK exporta trazas, metricas y logs por OTLP al colector de esa direccion
// (la lee el propio SDK del entorno). La instrumentacion de pino pone trace_id y
// span_id en cada linea de log y la manda tambien por OTLP.
if (loadConfig().otlpEndpoint) {
  new NodeSDK({
    serviceName: 'padel-backend',
    instrumentations: [
      new HttpInstrumentation(),
      // Solo para que la traza lleve la ruta (/me/bookings): un span por cada middleware de
      // express tapa lo que se quiere ensenar.
      new ExpressInstrumentation({
        ignoreLayersType: [ExpressLayerType.MIDDLEWARE, ExpressLayerType.REQUEST_HANDLER, ExpressLayerType.ROUTER],
      }),
      new NestInstrumentation(),
      new PgInstrumentation(),
      new MongoDBInstrumentation(),
      new RedisInstrumentation(),
      new PinoInstrumentation(),
    ],
  }).start();
}
