import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  jsonb,
} from 'drizzle-orm/pg-core';

// ─── Enums ───────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum('role', ['owner', 'admin']);
export const docTypeEnum = pgEnum('doc_type', ['quotation', 'voi', 'receipt']);
export const statusEnum = pgEnum('status', [
  'draft',
  'confirmed',
  'converted',
  'cancelled',
]);

// ─── Users ───────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 100 }).unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: varchar('full_name', { length: 200 }),
  role: roleEnum('role').default('admin').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Customers ───────────────────────────────────────────────────────────────
export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Products ────────────────────────────────────────────────────────────────
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  sku: varchar('sku', { length: 50 }),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  stock: integer('stock').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Document Item Type ───────────────────────────────────────────────────────
export type DocumentItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

// ─── Documents ───────────────────────────────────────────────────────────────
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  docNumber: varchar('doc_number', { length: 50 }).unique().notNull(),
  docType: docTypeEnum('doc_type').notNull(),
  customerId: uuid('customer_id').references(() => customers.id),
  customerName: varchar('customer_name', { length: 200 }),
  items: jsonb('items').$type<DocumentItem[]>(),
  subtotal: numeric('subtotal', { precision: 12, scale: 2 }),
  tax: numeric('tax', { precision: 12, scale: 2 }),
  total: numeric('total', { precision: 12, scale: 2 }).notNull(),
  status: statusEnum('status').default('draft'),
  notes: text('notes'),
  convertedFrom: uuid('converted_from'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
