// El lado de lectura no carga entidades: un finder lee de Postgres directamente
// a una vista, con la forma que necesita quien pregunta.
export interface ClubView {
  id: number;
  name: string;
}

export abstract class ClubsFinder {
  abstract all(): Promise<ClubView[]>;
}
