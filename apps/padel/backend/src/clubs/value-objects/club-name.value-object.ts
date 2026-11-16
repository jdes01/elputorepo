import { InvalidValueError } from '../../shared/invalid-value.error';

export class ClubName {
  static readonly MAX_LENGTH = 100;

  private constructor(private readonly value: string) {}

  static of(text: string): ClubName {
    const name = text.trim();
    if (name === '') throw new InvalidValueError('el nombre del club no puede estar vacio');
    if (name.length > ClubName.MAX_LENGTH) {
      throw new InvalidValueError(`el nombre del club no puede pasar de ${ClubName.MAX_LENGTH} caracteres`);
    }
    return new ClubName(name);
  }

  equals(other: ClubName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
