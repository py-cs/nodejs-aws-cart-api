import { Module } from '@nestjs/common';
import { OrderService } from './services';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
