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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  
  private userId: number;
  private categoryId: number;
  private productId: number;
  private cartItemId: number;
  private orderId: number;
  private orderItemId: number;
  private newsletterId: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.newsletterSubscribers = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.productId = 1;
    this.cartItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.newsletterId = 1;
    
    // Initialize with some sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Sample categories
    const categories = [
      { name: 'Earrings', slug: 'earrings', description: 'Elegant earrings for every occasion' },
      { name: 'Necklaces', slug: 'necklaces', description: 'Beautiful necklaces to complete your look' },
      { name: 'Bracelets', slug: 'bracelets', description: 'Delicate bracelets for your wrist' },
      { name: 'Rings', slug: 'rings', description: 'Stunning rings for every finger' }
    ];
    
    categories.forEach(category => this.createCategory(category));
    
    // Sample products
    const products = [
      { 
        stripeId: 'prod_sample1', 
        name: 'Pearl Drop Earrings', 
        description: 'Elegant pearl drop earrings with gold accents', 
        price: 95, 
        images: ['https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600'],
        categoryId: 1,
        inventory: 10,
        isNew: true,
        isBestSeller: true,
        metadata: {}
      },
      {
        stripeId: 'prod_sample2',
        name: 'Luna Gold Bracelet',
        description: '18k Gold bracelet with diamond accents',
        price: 195,
        images: ['https://pixabay.com/get/gc04632ca170484ff595c35a80c34192473f8eaf270e3a2f5695967625891849dca75699e9c33b48057e5b7e6637fa71bddb3805a4e41d7cce3042b3897eb286f_1280.png'],
        categoryId: 3,
        inventory: 5,
        isBestSeller: true,
        metadata: {}
      },
      {
        stripeId: 'prod_sample3',
        name: 'Celestial Diamond Necklace',
        description: 'A delicate diamond pendant necklace on gold chain',
        price: 125,
        images: ['https://pixabay.com/get/g6d224b67fc5ea501728b4c13476e927a9ed94f8b90953a3d0e8812da9e96d48f2fb0d397558912be4f5284a94e41ccce10fc5449816134a0043467888fd25b72_1280.jpg'],
        categoryId: 2,
        inventory: 8,
        metadata: {}
      },
      {
        stripeId: 'prod_sample4',
        name: 'Minimalist Silver Ring',
        description: 'A silver ring with minimalist design',
        price: 75,
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600'],
        categoryId: 4,
        inventory: 15,
        isBestSeller: true,
        metadata: {}
      }
    ];
    
    products.forEach(product => this.createProduct(product));
    
    // Create admin user
    this.createUser({
      email: 'admin@drbijuteria.com',
      password: '$2a$10$ePkq71KKLU.vTJGdm/chJuXbZwkWJjxJI0wCZuSMWGeiZLRxrpsRy', // 'admin123'
      name: 'Admin User',
      role: 'admin'
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const newUser: User = { 
      ...user, 
      id, 
      createdAt: now
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<User> {
    return this.updateUser(id, { stripeCustomerId });
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  // Product methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductByStripeId(stripeId: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.stripeId === stripeId);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const now = new Date();
    const newProduct: Product = { 
      ...product, 
      id, 
      isNew: product.isNew || false,
      isBestSeller: product.isBestSeller || false,
      isLimited: product.isLimited || false,
      createdAt: now 
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const product = await this.getProduct(id);
    if (!product) throw new Error('Product not found');
    
    const updatedProduct = { ...product, ...data };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async updateProductMetadata(id: number, metadata: { isNew?: boolean, isBestSeller?: boolean, isLimited?: boolean, categoryId?: number }): Promise<Product> {
    return this.updateProduct(id, metadata);
  }
  
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProductsByCategory(categorySlug: string): Promise<Product[]> {
    const category = await this.getCategoryBySlug(categorySlug);
    if (!category) return [];
    
    return Array.from(this.products.values()).filter(product => product.categoryId === category.id);
  }
  
  async getBestSellerProducts(limit?: number): Promise<Product[]> {
    const bestSellers = Array.from(this.products.values()).filter(product => product.isBestSeller);
    return limit ? bestSellers.slice(0, limit) : bestSellers;
  }
  
  async getNewProducts(limit?: number): Promise<Product[]> {
    const newProducts = Array.from(this.products.values()).filter(product => product.isNew);
    return limit ? newProducts.slice(0, limit) : newProducts;
  }
  
  // Cart methods
  async getCartItem(id: number): Promise<(CartItem & { product: Product }) | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const product = this.products.get(cartItem.productId);
    if (!product) return undefined;
    
    return { ...cartItem, product };
  }
  
  async getCartByUserId(userId: number): Promise<(CartItem & { product: Product })[]> {
    const cartItems = Array.from(this.cartItems.values()).filter(item => item.userId === userId);
    
    return cartItems.map(item => {
      const product = this.products.get(item.productId)!;
      return { ...item, product };
    }).filter(item => item.product); // Filter out items with missing products
  }
  
  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if product exists
    const product = await this.getProduct(cartItem.productId);
    if (!product) throw new Error('Product not found');
    
    // Check if item already in cart
    const existingCartItem = Array.from(this.cartItems.values()).find(
      item => item.userId === cartItem.userId && item.productId === cartItem.productId
    );
    
    if (existingCartItem) {
      // Update quantity if already in cart
      return this.updateCartItemQuantity(
        existingCartItem.id, 
        existingCartItem.quantity + (cartItem.quantity || 1)
      );
    }
    
    // Add new item to cart
    const id = this.cartItemId++;
    const now = new Date();
    const newCartItem: CartItem = { 
      ...cartItem, 
      id, 
      createdAt: now 
    };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) throw new Error('Cart item not found');
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<void> {
    const cartItemIds = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.userId === userId)
      .map(([id]) => id);
    
    cartItemIds.forEach(id => this.cartItems.delete(id));
  }
  
  // Order methods
  async getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => {
        const product = this.products.get(item.productId)!;
        return { ...item, product };
      })
      .filter(item => item.product); // Filter out items with missing products
    
    return { ...order, items };
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const now = new Date();
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: now 
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
  
  async getOrdersByUserId(userId: number): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const orders = Array.from(this.orders.values()).filter(order => order.userId === userId);
    
    return Promise.all(orders.map(async order => {
      const orderWithItems = await this.getOrder(order.id);
      return orderWithItems!;
    }));
  }
  
  async getAllOrders(): Promise<(Order & { user: Omit<User, 'password'>, items: (OrderItem & { product: Product })[] })[]> {
    const orders = Array.from(this.orders.values());
    
    return Promise.all(orders.map(async order => {
      const orderWithItems = await this.getOrder(order.id);
      const user = this.users.get(order.userId);
      
      if (!user) throw new Error('User not found');
      
      const { password, ...userWithoutPassword } = user;
      
      return {
        ...orderWithItems!,
        user: userWithoutPassword
      };
    }));
  }
  
  // Newsletter methods
  async getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    return Array.from(this.newsletterSubscribers.values()).find(
      subscriber => subscriber.email === email
    );
  }
  
  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const id = this.newsletterId++;
    const now = new Date();
    const newSubscriber: NewsletterSubscriber = { 
      ...subscriber, 
      id, 
      createdAt: now 
    };
    this.newsletterSubscribers.set(id, newSubscriber);
    return newSubscriber;
  }
  
  async getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return Array.from(this.newsletterSubscribers.values());
  }
}

export const storage = new MemStorage();
