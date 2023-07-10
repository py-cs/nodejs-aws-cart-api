import { relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  uuid,
  integer,
  date,
  text,
  doublePrecision,
  json,
} from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('status', ['OPEN', 'ORDERED']);

export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: date('created_at').defaultNow(),
  updatedAt: date('updated_at').defaultNow(),
  status: statusEnum('status'),
});

export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id),
  cartId: uuid('cart_id')
    .notNull()
    .references(() => carts.id, { onDelete: 'cascade' }),
  count: integer('count').notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  cartId: uuid('cart_id')
    .notNull()
    .references(() => carts.id),
  payment: json('payment').notNull(),
  delivery: json('delivery').notNull(),
  comments: text('comments'),
  status: statusEnum('status'),
  total: integer('total').notNull(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  price: doublePrecision('price').notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  password: text('password').notNull(),
});

export const cartRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

export const productRelations = relations(products, ({ one }) => ({
  cartItems: one(cartItems, {
    fields: [products.id],
    references: [cartItems.productId],
  }),
}));

export const orderRelations = relations(orders, ({ one }) => ({
  cart: one(carts, {
    fields: [orders.cartId],
    references: [carts.id],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));

export const userRelations = relations(users, ({ one, many }) => ({
  cart: one(carts, {
    fields: [users.id],
    references: [carts.userId],
  }),
  orders: many(orders),
}));
