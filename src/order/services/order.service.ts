import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { PG_CONNECTION } from 'src/constants';
import { orders } from 'src/drizzle/schema';

@Injectable()
export class OrderService {
  constructor(@Inject(PG_CONNECTION) private db) {}

  async findById(orderId: string) {
    return this.db.query.orders.findFirst({ where: eq(orders.id, orderId) });
  }

  create(data: any) {
    return this.db.insert(orders).values({ ...data, status: 'OPEN' });
  }

  update(orderId, data) {
    return this.db
      .update(orders)
      .set(data)
      .where(eq(orders.id, orderId))
      .returning();
  }
}
