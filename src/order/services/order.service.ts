import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PG_CONNECTION } from 'src/constants';
import { orders } from 'src/drizzle/schema';
import * as schema from 'src/drizzle/schema';

@Injectable()
export class OrderService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async findById(orderId: string) {
    return this.db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  }

  async create(data: any) {
    const { cartId } = data;
    console.log('creating order for cart', cartId);
    await this.db.transaction(async (tx) => {
      await tx
        .update(schema.carts)
        .set({ status: 'ORDERED' })
        .where(eq(schema.carts.id, cartId));
      await tx.insert(schema.orders).values({ ...data, status: 'OPEN' });
    });

    return this.db.query.orders.findFirst({ where: eq(orders.cartId, cartId) });
  }

  update(orderId, data) {
    return this.db
      .update(orders)
      .set(data)
      .where(eq(orders.id, orderId))
      .returning();
  }
}
