import { Module } from '@nestjs/common';

import { UsersService } from './services';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
