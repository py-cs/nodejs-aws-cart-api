import { Inject, Injectable } from '@nestjs/common';
import { cartItems, carts } from 'src/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { PG_CONNECTION } from 'src/constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/drizzle/schema';

@Injectable()
export class CartService {
  constructor(
    @Inject(PG_CONNECTION) private db: NodePgDatabase<typeof schema>,
  ) {}

  async findByUserId(userId: string) {
    return this.db.query.carts.findFirst({
      where: and(eq(carts.userId, userId), eq(carts.status, 'OPEN')),
      columns: { id: true },
      with: {
        items: { columns: { count: true }, with: { product: true } },
      },
    });
  }

  async createByUserId(userId: string) {
    await this.db.insert(carts).values({ userId, status: 'OPEN' });
    return this.findByUserId(userId);
  }

  async findOrCreateByUserId(userId: string) {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }
    return this.createByUserId(userId);
  }

  async updateByUserId(
    userId: string,
    { items }: { items: { productId: string; count: number }[] },
  ) {
    const cart = await this.findByUserId(userId);

    const res = await this.db
      .insert(cartItems)
      .values(items.map((item) => ({ ...item, cartId: cart.id })))
      .returning();

    return this.findByUserId(userId);
  }

  async removeByUserId(userId: string) {
    const { id: cartId } = await this.db.query.carts.findFirst({
      where: and(eq(carts.userId, userId), eq(carts.status, 'OPEN')),
    });

    await this.db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }
}
