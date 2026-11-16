import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadConfig } from './config';

// El schema lo aplican las migraciones (`make migrate`) antes de arrancar: la
// app asume que la BD esta al dia.
async function main() {
  const { port } = loadConfig();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(port);
  console.log(`escuchando en http://localhost:${port}`);
}

main();
