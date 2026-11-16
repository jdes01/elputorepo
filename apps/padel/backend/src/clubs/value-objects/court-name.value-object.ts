import { InvalidValueError } from '../../shared/invalid-value.error';

export class CourtName {
  static readonly MAX_LENGTH = 100;

  private constructor(private readonly value: string) {}

  static of(text: string): CourtName {
    const name = text.trim();
    if (name === '') throw new InvalidValueError('el nombre de la pista no puede estar vacio');
    if (name.length > CourtName.MAX_LENGTH) {
      throw new InvalidValueError(`el nombre de la pista no puede pasar de ${CourtName.MAX_LENGTH} caracteres`);
    }
    return new CourtName(name);
  }

  equals(other: CourtName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
