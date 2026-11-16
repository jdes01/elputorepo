import type { UserId } from '../../../domain/value-objects/user-id.value-object';

// "Mis reservas" con el nombre de la pista y del club: una vista hecha para esa
// pantalla, no una entity con campos que a veces vienen.
export interface MyBookingView {
  id: number;
  courtId: number;
  userId: string;
  date: string;
  start: string;
  end: string;
  courtName: string;
  clubName: string;
}

export abstract class MyBookingsFinder {
  // Por fecha y hora de inicio.
  abstract ofUser(userId: UserId): Promise<MyBookingView[]>;
}
