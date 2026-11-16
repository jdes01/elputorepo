import { InvalidValueError } from '../../../shared/domain/errors/invalid-value.error';

export class ClubId {
  private constructor(private readonly value: number) {}

  static of(value: number): ClubId {
    if (!Number.isInteger(value) || value <= 0) throw new InvalidValueError(`id de club invalido: ${value}`);
    return new ClubId(value);
  }

  equals(other: ClubId): boolean {
    return this.value === other.value;
  }

  toNumber(): number {
    return this.value;
  }
}
