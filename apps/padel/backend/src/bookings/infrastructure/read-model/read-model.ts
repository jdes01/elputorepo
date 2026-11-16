import type { Db } from 'mongodb';

// El modelo de lectura: documentos con la forma de cada pregunta, ya
// desnormalizados. Nadie los escribe a mano: los mantiene el proyector con los
// eventos, y se pueden tirar y rehacer desde Postgres.

// Lo que hace falta saber de una pista para leer: su horario y sus nombres.
export interface CourtDoc {
  _id: number;
  clubId: number;
  name: string;
  clubName: string;
  opens: string;
  closes: string;
}

// Las franjas reservadas de una pista un dia.
export interface CourtDayDoc {
  _id: string;
  courtId: number;
  date: string;
  bookedStarts: string[];
}

// Una fila de "mis reservas", con todo lo que ensena la pantalla.
export interface MyBookingDoc {
  _id: number;
  userId: string;
  courtId: number;
  date: string;
  start: string;
  end: string;
  courtName: string;
  clubName: string;
}

export const courtDayId = (courtId: number, date: string) => `${courtId}|${date}`;

export function readModel(db: Db) {
  return {
    courts: db.collection<CourtDoc>('courts'),
    courtDays: db.collection<CourtDayDoc>('court_days'),
    myBookings: db.collection<MyBookingDoc>('my_bookings'),
  };
}
