import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadConfig } from './config';
import { DomainErrorFilter } from './domain-error.filter';

// El schema lo aplican las migraciones (`make migrate`) antes de arrancar: la
// app asume que la BD esta al dia.
async function main() {
  const { port } = loadConfig();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new DomainErrorFilter());
  await app.listen(port);
  console.log(`escuchando en http://localhost:${port}`);
}

main();
