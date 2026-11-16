import type { INestApplication } from '@nestjs/common';
import { DomainErrorFilter } from './domain-error.filter';

// Lo que hace de la app una API HTTP. Lo usan main.ts y los tests de los
// controllers: la app que se prueba es la que se despliega.
export function configureHttp(app: INestApplication): INestApplication {
  app.enableCors();
  app.useGlobalFilters(new DomainErrorFilter());
  return app;
}
