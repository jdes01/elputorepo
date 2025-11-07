import { User } from '../entities/user';
import { UserId } from '../value-objects/user-id';

export abstract class UserRepository {
  abstract save(user: User): Promise<void>;
  abstract findById(userId: UserId): Promise<User | null>;
}

