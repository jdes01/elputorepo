import { Result } from 'neverthrow';
import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id';

export abstract class UserRepository {
  abstract save(user: User): Promise<Result<void, Error>>;
  abstract findById(userId: UserId): Promise<Result<User | null, Error>>;
}

