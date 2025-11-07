import { UserId } from '../value-objects/user-id';

export interface UserPrimitives {
  id: string;
  email: string;
}

export class User {
  constructor(
    public readonly id: UserId,
    public readonly email: string,
  ) {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
  }

  static fromPrimitives(data: UserPrimitives): User {
    return new User(new UserId(data.id), data.email);
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.id.value,
      email: this.email,
    };
  }
}

