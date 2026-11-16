export interface Club {
  id: number;
  name: string;
}

export interface Court {
  id: number;
  club_id: number;
  name: string;
  opens: string;
  closes: string;
}
