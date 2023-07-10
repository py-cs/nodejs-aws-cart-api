import { drizzle } from 'drizzle-orm/postgres-js';
import { env } from './src/env';
import * as schema from './src/drizzle/schema';
import postgres from 'postgres';

const sql = postgres({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 1,
  ssl: 'allow',
});

const db = drizzle(sql, { schema });

async function main() {
  const [user] = await db
    .insert(schema.users)
    .values({ name: 'John', email: 'email', password: 'password' })
    .returning();

  const [cart] = await db
    .insert(schema.carts)
    .values({ userId: user.id, status: 'OPEN' })
    .returning();

  const products = await db
    .insert(schema.products)
    .values([
      { title: 'Product 1', description: 'Description 1', price: 1 },
      { title: 'Product 2', description: 'Description 2', price: 5 },
      { title: 'Product 3', description: 'Description 3', price: 10 },
    ])
    .returning();

  const cartItems = await db
    .insert(schema.cartItems)
    .values([
      { cartId: cart.id, productId: products[0].id, count: 1 },
      { cartId: cart.id, productId: products[1].id, count: 2 },
    ])
    .returning();

  const [_order] = await db
    .insert(schema.orders)
    .values({
      id: '123e4567-e89b-12d3-a456-426655440000',
      cartId: cart.id,
      status: 'OPEN',
      userId: user.id,
      delivery: 'delivery',
      payment: 'card',
      total: 10,
    })
    .returning();
}

main();
