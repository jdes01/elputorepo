import { describe, expect, it } from 'vitest';
import { TimeOfDay } from '../../../shared/domain/value-objects/time-of-day.value-object';
import { Club } from './club.entity';
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
});
