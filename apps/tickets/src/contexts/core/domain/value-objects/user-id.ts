export class UserId {
  constructor(public readonly value: string) {
    if (!value) {
      throw new Error('User ID cannot be empty');
    }
  }

  equals(other: UserId): boolean {
    return this.value === other.value;
  }
}

