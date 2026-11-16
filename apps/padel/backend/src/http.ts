import type { INestApplication } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { DomainErrorFilter } from './domain-error.filter';

// Lo que hace de la app una API HTTP. Lo usan main.ts y los tests de los
// controllers: la app que se prueba es la que se despliega. Hay que crearla con
// `bufferLogs: true` para que lo que Nest escribe al arrancar salga ya en JSON.
export function configureHttp(app: INestApplication): INestApplication {
  app.useLogger(app.get(Logger));
  app.enableCors();
  app.useGlobalFilters(new DomainErrorFilter());
  return app;
}
