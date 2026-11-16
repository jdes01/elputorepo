import { InvalidValueError } from '../../shared/invalid-value.error';

export class BookingId {
  private constructor(private readonly value: number) {}

  static of(value: number): BookingId {
    if (!Number.isInteger(value) || value <= 0) throw new InvalidValueError(`id de reserva invalido: ${value}`);
    return new BookingId(value);
  }

  equals(other: BookingId): boolean {
    return this.value === other.value;
  }

  toNumber(): number {
    return this.value;
  }
}
