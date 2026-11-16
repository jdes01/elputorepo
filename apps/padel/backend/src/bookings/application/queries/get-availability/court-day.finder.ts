import type { CourtId } from '../../../../clubs/domain/value-objects/court-id.value-object';
import type { CalendarDate } from '../../../../shared/domain/value-objects/calendar-date.value-object';

// Lo minimo para calcular la disponibilidad de una pista un dia: su horario y a
// que horas empiezan las reservas que ya tiene.
export interface CourtDayView {
  opens: string;
  closes: string;
  bookedStarts: string[];
}

export abstract class CourtDayFinder {
  abstract find(courtId: CourtId, date: CalendarDate): Promise<CourtDayView | undefined>;
}
