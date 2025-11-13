import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { User } from '../../domain/entities/user';
import { UserId } from '../../domain/value-objects/user-id';

@Injectable()
export class PrismaUserRepository extends UserRepository {
  private readonly logger = new Logger(PrismaUserRepository.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(user: User): Promise<void> {
    const primitives = user.toPrimitives();
    await this.prisma.userProjection.upsert({
      where: { id: primitives.id },
      create: {
        id: primitives.id,
        email: primitives.email,
      },
      update: {
        email: primitives.email,
      },
    });
    this.logger.log(`User saved: ${primitives.id} with email ${primitives.email}`);
  }

  async findById(userId: UserId): Promise<User | null> {
    const result = await this.prisma.userProjection.findUnique({
      where: { id: userId.value },
    });

    if (!result) {
      return null;
    }

    return User.fromPrimitives({
      id: result.id,
      email: result.email,
    });
  }
}
