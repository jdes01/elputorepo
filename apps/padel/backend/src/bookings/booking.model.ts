export interface Booking {
  id: number;
  court_id: number;
  user_id: string;
  date: string;
  start: string;
  end: string;
  // Solo en "mis reservas".
  court_name?: string;
  club_name?: string;
}

export interface Slot {
  start: string;
  end: string;
  free: boolean;
}
