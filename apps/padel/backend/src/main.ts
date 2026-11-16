import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { loadConfig } from './config';
import { configureHttp } from './http';

// El schema lo aplican las migraciones (`make migrate`) antes de arrancar: la
// app asume que la BD esta al dia.
async function main() {
  const { port } = loadConfig();
  const app = configureHttp(await NestFactory.create(AppModule, { bufferLogs: true }));
  await app.listen(port);
  app.get(Logger).log(`escuchando en http://localhost:${port}`);
}

main();
