import { InvalidValueError } from '../../shared/invalid-value.error';

export class CourtId {
  private constructor(private readonly value: number) {}

  static of(value: number): CourtId {
    if (!Number.isInteger(value) || value <= 0) throw new InvalidValueError(`id de pista invalido: ${value}`);
    return new CourtId(value);
  }

  equals(other: CourtId): boolean {
    return this.value === other.value;
  }

  toNumber(): number {
    return this.value;
  }
}
