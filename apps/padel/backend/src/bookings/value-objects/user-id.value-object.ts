import { InvalidValueError } from '../../shared/invalid-value.error';

// Quien reserva. De momento, lo que llegue en la cabecera X-User-Id.
export class UserId {
  private constructor(private readonly value: string) {}

  static of(text: string): UserId {
    const id = text.trim();
    if (id === '') throw new InvalidValueError('el id de usuario no puede estar vacio');
    return new UserId(id);
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
