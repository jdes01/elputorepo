import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadConfig } from './config';
import { InvalidValueFilter } from './shared/invalid-value.filter';

// El schema lo aplican las migraciones (`make migrate`) antes de arrancar: la
// app asume que la BD esta al dia.
async function main() {
  const { port } = loadConfig();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalFilters(new InvalidValueFilter());
  await app.listen(port);
  console.log(`escuchando en http://localhost:${port}`);
}

main();
