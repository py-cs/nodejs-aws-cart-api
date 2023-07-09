import { Inject, Injectable } from '@nestjs/common';
import { cartItems, carts } from 'src/drizzle/schema';
import { eq } from 'drizzle-orm';
import { PG_CONNECTION } from 'src/constants';

@Injectable()
export class CartService {
  constructor(@Inject(PG_CONNECTION) private db) {}

  async findByUserId(userId: string) {
    return this.db.query.carts.findFirst({
      where: eq(carts.userId, userId),
      columns: { id: true },
      with: {
        items: { columns: { count: true }, with: { product: true } },
      },
    });
  }

  async createByUserId(userId: string) {
    await this.db.insert(carts).values({ userId });
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
    const { id } = await this.db.query.carts.findFirst({
      where: eq(carts.userId, userId),
    });
    await this.db
      .insert(cartItems)
      .values(items.map((item) => ({ ...item, cartId: id })));

    return this.findByUserId(userId);
  }

  async removeByUserId(userId: string) {
    const res = await this.db.delete(carts).where(eq(carts.userId, userId));
    console.log(res);
  }
}
