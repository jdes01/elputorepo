import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { db } from './app.controller';

async function main() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS clubs (
      id SERIAL PRIMARY KEY,
      name TEXT
    );
    CREATE TABLE IF NOT EXISTS courts (
      id SERIAL PRIMARY KEY,
      club_id INT,
      name TEXT,
      opens TEXT,
      closes TEXT
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      court_id INT,
      user_id TEXT,
      date TEXT,
      start TEXT,
      "end" TEXT
    );
  `);
  console.log('tablas creadas');

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`escuchando en http://localhost:${port}`);
}

main();
