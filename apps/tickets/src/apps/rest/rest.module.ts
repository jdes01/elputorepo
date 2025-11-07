import { Module } from '@nestjs/common';
import { CoreRestModule } from './core/core-rest.module';

@Module({
  imports: [CoreRestModule],
})
export class RestModule {}
