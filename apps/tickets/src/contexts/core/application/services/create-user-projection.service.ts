import { Injectable, Logger } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user';

@Injectable()
export class CreateUserProjectionService {
  private readonly logger = new Logger(CreateUserProjectionService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, email: string): Promise<void> {
    const user = User.fromPrimitives({
      id: userId,
      email,
    });
    await this.userRepository.save(user);
    this.logger.log(`User projection created: ${userId} with email ${email}`);
  }
}
