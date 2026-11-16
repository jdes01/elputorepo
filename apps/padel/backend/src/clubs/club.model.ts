import { TimeOfDay } from '../shared/value-objects/time-of-day.value-object';
import { ClubId } from './value-objects/club-id.value-object';
import { ClubName } from './value-objects/club-name.value-object';
import { CourtId } from './value-objects/court-id.value-object';
import { CourtName } from './value-objects/court-name.value-object';
import { OpeningHours } from './value-objects/opening-hours.value-object';

export interface Club {
  id: ClubId;
  name: ClubName;
}

export interface Court {
  id: CourtId;
  clubId: ClubId;
  name: CourtName;
  openingHours: OpeningHours;
}

export interface ClubRow {
  id: number;
  name: string;
}

export interface CourtRow {
  id: number;
  club_id: number;
  name: string;
  opens: string;
  closes: string;
}

export function clubFromRow(row: ClubRow): Club {
  return { id: ClubId.of(row.id), name: ClubName.of(row.name) };
}

export function courtFromRow(row: CourtRow): Court {
  return {
    id: CourtId.of(row.id),
    clubId: ClubId.of(row.club_id),
    name: CourtName.of(row.name),
    openingHours: OpeningHours.of(TimeOfDay.parse(row.opens), TimeOfDay.parse(row.closes)),
  };
}
