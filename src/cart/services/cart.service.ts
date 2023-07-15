import { Inject, Injectable } from '@nestjs/common';
import { cartItems, carts, products } from 'src/drizzle/schema';
import { and, eq } from 'drizzle-orm';
import { PG_CONNECTION } from 'src/constants';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/drizzle/schema';
import { Product } from '../models';

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
        items: { columns: { count: true, id: true }, with: { product: true } },
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
    { count, product }: { count: number; product: Product },
  ) {
    const cart = await this.findByUserId(userId);

    const itemToUpdate = cart.items.find(
      (item) => item.product.id === product.id,
    );

    if (itemToUpdate) {
      if (count) {
        await this.db
          .update(cartItems)
          .set({ count })
          .where(eq(cartItems.id, itemToUpdate.id));
      } else {
        await this.db
          .delete(cartItems)
          .where(eq(cartItems.id, itemToUpdate.id));
      }
    } else {
      let savedProduct = await this.db.query.products.findFirst({
        where: eq(products.id, product.id),
      });

      if (!savedProduct) {
        [savedProduct] = await this.db
          .insert(products)
          .values(product)
          .returning();
      }

      await this.db
        .insert(cartItems)
        .values({ cartId: cart.id, count, productId: savedProduct.id });
    }

    return this.findByUserId(userId);
  }

  async removeByUserId(userId: string) {
    const { id: cartId } = await this.db.query.carts.findFirst({
      where: and(eq(carts.userId, userId), eq(carts.status, 'OPEN')),
    });

    await this.db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }
}
