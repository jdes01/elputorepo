import { describe, expect, it } from 'vitest';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { TimeSlot } from '../../../shared/domain/value-objects/time-slot.value-object';
import { Club } from './club.entity';
import { SlotOutsideOpeningHours } from '../errors/club.errors';
import { Court } from './court.entity';
import { ClubId } from '../value-objects/club-id.value-object';
import { ClubName } from '../value-objects/club-name.value-object';
import { CourtId } from '../value-objects/court-id.value-object';
import { CourtName } from '../value-objects/court-name.value-object';
import { OpeningHours } from '../value-objects/opening-hours.value-object';

const at = (text: string) => TimeOfDay.parse(text);
const club = Club.register(ClubId.of(1), ClubName.of('Club Norte'));
const court = Court.open(CourtId.of(1), club, CourtName.of('Pista 1'), OpeningHours.of(at('09:00'), at('15:00')));

describe('Court', () => {
  it('se abre en un club', () => {
    expect(court.clubId.equals(club.id)).toBe(true);
  });

  it('da la franja que empieza a una hora de su rejilla', () => {
    expect(court.slotAt(at('10:30')).end.toString()).toBe('12:00');
  });

  it.each(['10:00', '08:00', '15:00'])('no tiene franja a las %s', (start) => {
    expect(() => court.slotAt(at(start))).toThrow(SlotOutsideOpeningHours);
  });

  it('marca como ocupadas las franjas que pisa una reserva', () => {
    const availability = court.availability([TimeSlot.startingAt(at('10:30'))]);

    expect(availability.map(({ slot, free }) => `${slot.start} ${free ? 'libre' : 'ocupada'}`)).toEqual([
      '09:00 libre',
      '10:30 ocupada',
      '12:00 libre',
      '13:30 libre',
    ]);
  });
});
