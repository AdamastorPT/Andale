import { pgTable, text, serial, integer, boolean, timestamp, jsonb, foreignKey, numeric, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  password: text("password").notNull(),
  address: text("address"),
  phone: text("phone"),
  role: text("role").default("user").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories Table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

// Products Table (synced from Stripe)
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  stripeId: text("stripe_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  images: text("images").array(),
  categoryId: integer("category_id").references(() => categories.id),
  inventory: integer("inventory").default(0),
  isNew: boolean("is_new").default(false),
  isBestSeller: boolean("is_best_seller").default(false),
  isLimited: boolean("is_limited").default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders Table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  status: text("status").default("pending").notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  shipping: jsonb("shipping"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Order Items Table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

// Cart Items Table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Newsletter Subscribers Table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  confirmedAt: timestamp("confirmed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas 
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, stripeCustomerId: true });

export const insertCategorySchema = createInsertSchema(categories)
  .omit({ id: true });

export const insertProductSchema = createInsertSchema(products)
  .omit({ id: true, createdAt: true });

export const insertOrderSchema = createInsertSchema(orders)
  .omit({ id: true, createdAt: true });

export const insertOrderItemSchema = createInsertSchema(orderItems)
  .omit({ id: true });

export const insertCartItemSchema = createInsertSchema(cartItems)
  .omit({ id: true, createdAt: true });

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers)
  .omit({ id: true, confirmedAt: true, createdAt: true });

// Extended schemas with validation
export const registerUserSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
