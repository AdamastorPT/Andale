import { 
  User, InsertUser, 
  Category, InsertCategory,
  Product, InsertProduct,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  CartItem, InsertCartItem,
  NewsletterSubscriber, InsertNewsletterSubscriber
} from "@shared/schema";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Categories
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  getAllCategories(): Promise<Category[]>;
  
  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProductByStripeId(stripeId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<Product>): Promise<Product>;
  updateProductMetadata(id: number, metadata: { isNew?: boolean, isBestSeller?: boolean, isLimited?: boolean, categoryId?: number }): Promise<Product>;
  getAllProducts(): Promise<Product[]>;
  getProductsByCategory(categorySlug: string): Promise<Product[]>;
  getBestSellerProducts(limit?: number): Promise<Product[]>;
  getNewProducts(limit?: number): Promise<Product[]>;
  
  // Cart
  getCartItem(id: number): Promise<(CartItem & { product: Product }) | undefined>;
  getCartByUserId(userId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(userId: number): Promise<void>;
  
  // Orders
  getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrdersByUserId(userId: number): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]>;
  getAllOrders(): Promise<(Order & { user: Omit<User, 'password'>, items: (OrderItem & { product: Product })[] })[]>;
  
  // Newsletter
  getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
  createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;
}

import { db } from './db';
import { eq, and, desc, asc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from '@shared/schema';

export class DrizzleStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user;
  }
  
  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const [newUser] = await db.insert(schema.users).values({
      ...user,
      createdAt: new Date()
    }).returning();
    return newUser;
  }
  
  async updateUser(id: number, data: Partial<schema.User>): Promise<schema.User> {
    const [updatedUser] = await db
      .update(schema.users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }
  
  async updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<schema.User> {
    return this.updateUser(id, { stripeCustomerId });
  }
  
  async getAllUsers(): Promise<schema.User[]> {
    return db.select().from(schema.users);
  }
  
  // Category methods
  async getCategory(id: number): Promise<schema.Category | undefined> {
    const [category] = await db.select().from(schema.categories).where(eq(schema.categories.id, id));
    return category;
  }
  
  async getCategoryBySlug(slug: string): Promise<schema.Category | undefined> {
    const [category] = await db.select().from(schema.categories).where(eq(schema.categories.slug, slug));
    return category;
  }
  
  async createCategory(category: schema.InsertCategory): Promise<schema.Category> {
    const [newCategory] = await db.insert(schema.categories).values(category).returning();
    return newCategory;
  }
  
  async getAllCategories(): Promise<schema.Category[]> {
    return db.select().from(schema.categories);
  }
  
  // Product methods
  async getProduct(id: number): Promise<schema.Product | undefined> {
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
    return product;
  }
  
  async getProductByStripeId(stripeId: string): Promise<schema.Product | undefined> {
    const [product] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.stripeId, stripeId));
    
    return product;
  }
  
  async createProduct(product: schema.InsertProduct): Promise<schema.Product> {
    const [newProduct] = await db.insert(schema.products).values({
      ...product,
      isNew: product.isNew || false,
      isBestSeller: product.isBestSeller || false,
      isLimited: product.isLimited || false,
      createdAt: new Date()
    }).returning();
    return newProduct;
  }
  
  async updateProduct(id: number, data: Partial<schema.Product>): Promise<schema.Product> {
    const [updatedProduct] = await db
      .update(schema.products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.products.id, id))
      .returning();
    
    if (!updatedProduct) {
      throw new Error(`Product with id ${id} not found`);
    }
    
    return updatedProduct;
  }
  
  async updateProductMetadata(
    id: number,
    metadata: { 
      isNew?: boolean, 
      isBestSeller?: boolean, 
      isLimited?: boolean, 
      categoryId?: number 
    }
  ): Promise<schema.Product> {
    return this.updateProduct(id, metadata);
  }
  
  async getAllProducts(): Promise<schema.Product[]> {
    return db.select().from(schema.products);
  }
  
  async getProductsByCategory(categorySlug: string): Promise<schema.Product[]> {
    const category = await this.getCategoryBySlug(categorySlug);
    if (!category) {
      return [];
    }
    
    return db
      .select()
      .from(schema.products)
      .where(eq(schema.products.categoryId, category.id));
  }
  
  async getBestSellerProducts(limit?: number): Promise<schema.Product[]> {
    const query = db
      .select()
      .from(schema.products)
      .where(eq(schema.products.isBestSeller, true));
    
    if (limit) {
      query.limit(limit);
    }
    
    return query;
  }
  
  async getNewProducts(limit?: number): Promise<schema.Product[]> {
    const query = db
      .select()
      .from(schema.products)
      .where(eq(schema.products.isNew, true));
    
    if (limit) {
      query.limit(limit);
    }
    
    return query;
  }
  
  // Cart methods
  async getCartItem(id: number): Promise<(schema.CartItem & { product: schema.Product }) | undefined> {
    const [cartItem] = await db
      .select()
      .from(schema.cartItems)
      .where(eq(schema.cartItems.id, id));
    
    if (!cartItem) {
      return undefined;
    }
    
    const product = await this.getProduct(cartItem.productId);
    if (!product) {
      throw new Error(`Product with id ${cartItem.productId} not found`);
    }
    
    return { ...cartItem, product };
  }
  
  async getCartByUserId(userId: number): Promise<(schema.CartItem & { product: schema.Product })[]> {
    const cartItems = await db
      .select()
      .from(schema.cartItems)
      .where(eq(schema.cartItems.userId, userId));
    
    const result: (schema.CartItem & { product: schema.Product })[] = [];
    
    for (const item of cartItems) {
      const product = await this.getProduct(item.productId);
      if (product) {
        result.push({ ...item, product });
      }
    }
    
    return result;
  }
  
  async addToCart(cartItem: schema.InsertCartItem): Promise<schema.CartItem> {
    // Check if product exists
    const product = await this.getProduct(cartItem.productId);
    if (!product) {
      throw new Error(`Product with id ${cartItem.productId} not found`);
    }
    
    // Check if item already in cart
    const [existingItem] = await db
      .select()
      .from(schema.cartItems)
      .where(
        and(
          eq(schema.cartItems.userId, cartItem.userId),
          eq(schema.cartItems.productId, cartItem.productId)
        )
      );
    
    if (existingItem) {
      // Update quantity if already in cart
      return this.updateCartItemQuantity(
        existingItem.id, 
        existingItem.quantity + (cartItem.quantity || 1)
      );
    }
    
    const [newCartItem] = await db
      .insert(schema.cartItems)
      .values({
        ...cartItem,
        createdAt: new Date()
      })
      .returning();
    
    return newCartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<schema.CartItem> {
    const [updatedCartItem] = await db
      .update(schema.cartItems)
      .set({ quantity })
      .where(eq(schema.cartItems.id, id))
      .returning();
    
    if (!updatedCartItem) {
      throw new Error(`Cart item with id ${id} not found`);
    }
    
    return updatedCartItem;
  }
  
  async removeFromCart(id: number): Promise<void> {
    await db
      .delete(schema.cartItems)
      .where(eq(schema.cartItems.id, id));
  }
  
  async clearCart(userId: number): Promise<void> {
    await db
      .delete(schema.cartItems)
      .where(eq(schema.cartItems.userId, userId));
  }
  
  // Order methods
  async getOrder(id: number): Promise<(schema.Order & { items: (schema.OrderItem & { product: schema.Product })[] }) | undefined> {
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, id));
    
    if (!order) {
      return undefined;
    }
    
    const orderItems = await db
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, id));
    
    const items: (schema.OrderItem & { product: schema.Product })[] = [];
    
    for (const item of orderItems) {
      const product = await this.getProduct(item.productId);
      if (product) {
        items.push({ ...item, product });
      }
    }
    
    return { ...order, items };
  }
  
  async createOrder(order: schema.InsertOrder): Promise<schema.Order> {
    const [newOrder] = await db
      .insert(schema.orders)
      .values({
        ...order,
        createdAt: new Date()
      })
      .returning();
    
    return newOrder;
  }
  
  async createOrderItem(orderItem: schema.InsertOrderItem): Promise<schema.OrderItem> {
    const [newOrderItem] = await db
      .insert(schema.orderItems)
      .values(orderItem)
      .returning();
    
    return newOrderItem;
  }
  
  async getOrdersByUserId(userId: number): Promise<(schema.Order & { items: (schema.OrderItem & { product: schema.Product })[] })[]> {
    const orders = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.userId, userId))
      .orderBy(desc(schema.orders.createdAt));
    
    const result: (schema.Order & { items: (schema.OrderItem & { product: schema.Product })[] })[] = [];
    
    for (const order of orders) {
      const fullOrder = await this.getOrder(order.id);
      if (fullOrder) {
        result.push(fullOrder);
      }
    }
    
    return result;
  }
  
  async getAllOrders(): Promise<(schema.Order & { user: Omit<schema.User, 'password'>, items: (schema.OrderItem & { product: schema.Product })[] })[]> {
    const orders = await db
      .select()
      .from(schema.orders)
      .orderBy(desc(schema.orders.createdAt));
    
    const result: (schema.Order & { user: Omit<schema.User, 'password'>, items: (schema.OrderItem & { product: schema.Product })[] })[] = [];
    
    for (const order of orders) {
      const fullOrder = await this.getOrder(order.id);
      if (fullOrder) {
        const user = await this.getUser(order.userId);
        if (user) {
          const { password, ...userWithoutPassword } = user;
          result.push({ ...fullOrder, user: userWithoutPassword });
        }
      }
    }
    
    return result;
  }
  
  // Newsletter methods
  async getNewsletterSubscriberByEmail(email: string): Promise<schema.NewsletterSubscriber | undefined> {
    const [subscriber] = await db
      .select()
      .from(schema.newsletterSubscribers)
      .where(eq(schema.newsletterSubscribers.email, email));
    
    return subscriber;
  }
  
  async createNewsletterSubscriber(subscriber: schema.InsertNewsletterSubscriber): Promise<schema.NewsletterSubscriber> {
    const [newSubscriber] = await db
      .insert(schema.newsletterSubscribers)
      .values({
        ...subscriber,
        createdAt: new Date()
      })
      .returning();
    
    return newSubscriber;
  }
  
  async getAllNewsletterSubscribers(): Promise<schema.NewsletterSubscriber[]> {
    return db.select().from(schema.newsletterSubscribers);
  }
}

// Initialize database with sample data if empty
async function initializeDatabase() {
  try {
    console.log('Checking if database needs initialization...');
    
    // Check if there are any categories
    const categories = await db.select().from(schema.categories);
    
    if (categories.length === 0) {
      console.log('Database is empty. Initializing with sample data...');
      
      // Create sample categories
      const [earrings] = await db.insert(schema.categories).values({ 
        name: 'Brincos', 
        slug: 'earrings', 
        description: 'Brincos elegantes feitos com aço inoxidável' 
      }).returning();
      
      const [necklaces] = await db.insert(schema.categories).values({ 
        name: 'Colares', 
        slug: 'necklaces', 
        description: 'Colares modernos e delicados para qualquer ocasião' 
      }).returning();
      
      const [bracelets] = await db.insert(schema.categories).values({ 
        name: 'Pulseiras', 
        slug: 'bracelets', 
        description: 'Pulseiras elegantes e estilosas' 
      }).returning();
      
      const [rings] = await db.insert(schema.categories).values({ 
        name: 'Anéis', 
        slug: 'rings', 
        description: 'Anéis exclusivos em aço inoxidável' 
      }).returning();
      
      // Create sample products
      await db.insert(schema.products).values([
        {
          stripeId: 'prod_sample1',
          name: 'Brinco Pérola Dourado',
          price: 89.90,
          description: 'Brinco elegante com pérola e acabamento em aço inoxidável dourado',
          images: ['/assets/images/products/earring1.jpg'],
          stock: 15,
          categoryId: earrings.id,
          isNew: true,
          isBestSeller: true,
          isLimited: false,
          metadata: {},
          createdAt: new Date()
        },
        {
          stripeId: 'prod_sample2',
          name: 'Colar Coração Delicado',
          price: 129.90,
          description: 'Colar com pingente de coração em aço inoxidável',
          images: ['/assets/images/products/necklace1.jpg'],
          stock: 10,
          categoryId: necklaces.id,
          isNew: true,
          isBestSeller: false,
          isLimited: false,
          metadata: {},
          createdAt: new Date()
        },
        {
          stripeId: 'prod_sample3',
          name: 'Pulseira de Elos Prateada',
          price: 79.90,
          description: 'Pulseira de elos em aço inoxidável com acabamento prata',
          images: ['/assets/images/products/bracelet1.jpg'],
          stock: 20,
          categoryId: bracelets.id,
          isNew: false,
          isBestSeller: true,
          isLimited: false,
          metadata: {},
          createdAt: new Date()
        },
        {
          stripeId: 'prod_sample4',
          name: 'Anel Minimalista',
          price: 69.90,
          description: 'Anel minimalista em aço inoxidável',
          images: ['/assets/images/products/ring1.jpg'],
          stock: 5,
          categoryId: rings.id,
          isNew: false,
          isBestSeller: false,
          isLimited: true,
          metadata: {},
          createdAt: new Date()
        }
      ]);
      
      // Create sample admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.insert(schema.users).values({
        email: 'admin@drbijuteria.com',
        name: 'Admin DR Bijuteria',
        password: hashedPassword,
        role: 'admin',
        address: null,
        phone: null,
        stripeCustomerId: null,
        createdAt: new Date()
      });
      
      console.log('Database initialized with sample data successfully');
    } else {
      console.log('Database already contains data, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize the database with sample data
initializeDatabase();

export const storage = new DrizzleStorage();
