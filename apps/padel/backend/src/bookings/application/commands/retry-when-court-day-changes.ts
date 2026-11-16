import { CourtDayChangedMeanwhile } from '../../domain/errors/booking.errors';

const MAX_ATTEMPTS = 5;

// Si otra peticion cambio la agenda entre que la leimos y la guardamos, se vuelve
// a empezar: leer la agenda (ya con su cambio dentro) y volver a decidir. Puede
// que ahora la franja este ocupada, y eso ya es un error normal del dominio.
/* oxlint-disable no-await-in-loop */
export async function retryWhenCourtDayChanges<T>(attempt: () => Promise<T>): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await attempt();
    } catch (error) {
      if (!(error instanceof CourtDayChangedMeanwhile) || i >= MAX_ATTEMPTS) throw error;
    }
  }
}
/* oxlint-enable no-await-in-loop */
