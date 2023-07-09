import { Module } from '@nestjs/common';
import { OrderModule } from '../order/order.module';
import { CartController } from './cart.controller';
import { CartService } from './services';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [OrderModule, DrizzleModule],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
