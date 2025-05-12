import { 
  User, InsertUser, 
  Category, InsertCategory,
  Product, InsertProduct,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  CartItem, InsertCartItem,
  WishlistItem, InsertWishlistItem,
  Article, InsertArticle,
  NewsletterSubscriber, InsertNewsletterSubscriber
} from "@shared/schema";

// Modify the interface with any CRUD methods you might need
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  updateStripeCustomerId(id: number, stripeCustomerId: string): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<User>;
  updateUserProfileImage(id: number, imageUrl: string): Promise<User>;
  createPasswordResetToken(email: string): Promise<string | null>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
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
  
  // Wishlist
  getWishlistItem(id: number): Promise<(WishlistItem & { product: Product }) | undefined>;
  getWishlistByUserId(userId: number): Promise<(WishlistItem & { product: Product })[]>;
  addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(id: number): Promise<void>;
  isProductInWishlist(userId: number, productId: number): Promise<boolean>;
  
  // Articles
  getArticle(id: number): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, data: Partial<Article>): Promise<Article>;
  publishArticle(id: number): Promise<Article>;
  getAllArticles(publishedOnly?: boolean): Promise<Article[]>;
  getArticlesByAuthor(authorId: number): Promise<Article[]>;
  
  // Newsletter
  getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
  createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;
}

// Memória temporária para armazenamento de dados
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private wishlistItems: Map<number, WishlistItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private articles: Map<number, Article>;
  private newsletterSubscribers: Map<number, NewsletterSubscriber>;
  
  private userId: number;
  private categoryId: number;
  private productId: number;
  private cartItemId: number;
  private wishlistItemId: number;
  private orderId: number;
  private orderItemId: number;
  private articleId: number;
  private newsletterId: number;
  
  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.wishlistItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.articles = new Map();
    this.newsletterSubscribers = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.productId = 1;
    this.cartItemId = 1;
    this.wishlistItemId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.articleId = 1;
    this.newsletterId = 1;
    
    // Initialize with some sample data
    this.initSampleData();
  }
  
  private initSampleData() {
    // Sample categories
    const categories = [
      { name: 'Brincos', slug: 'earrings', description: 'Brincos elegantes feitos com aço inoxidável' },
      { name: 'Colares', slug: 'necklaces', description: 'Colares modernos e delicados para qualquer ocasião' },
      { name: 'Pulseiras', slug: 'bracelets', description: 'Pulseiras elegantes e estilosas' },
      { name: 'Anéis', slug: 'rings', description: 'Anéis exclusivos em aço inoxidável' }
    ];
    
    for (const category of categories) {
      this.createCategory(category);
    }
    
    // Sample products
    const products = [
      { 
        stripeId: 'prod_sample1', 
        name: 'Brinco Pérola Dourado', 
        description: 'Brinco elegante com pérola e acabamento em aço inoxidável dourado', 
        price: "89.90", 
        images: ['/assets/images/products/earring1.jpg'],
        categoryId: 1,
        stock: 15,
        isNew: true,
        isBestSeller: true,
        isLimited: false,
        metadata: {}
      },
      {
        stripeId: 'prod_sample2',
        name: 'Colar Coração Delicado',
        description: 'Colar com pingente de coração em aço inoxidável',
        price: "129.90",
        images: ['/assets/images/products/necklace1.jpg'],
        categoryId: 2,
        stock: 10,
        isNew: true,
        isBestSeller: false,
        isLimited: false,
        metadata: {}
      },
      {
        stripeId: 'prod_sample3',
        name: 'Pulseira de Elos Prateada',
        description: 'Pulseira de elos em aço inoxidável com acabamento prata',
        price: "79.90",
        images: ['/assets/images/products/bracelet1.jpg'],
        categoryId: 3,
        stock: 20,
        isNew: false,
        isBestSeller: true,
        isLimited: false,
        metadata: {}
      },
      {
        stripeId: 'prod_sample4',
        name: 'Anel Minimalista',
        description: 'Anel minimalista em aço inoxidável',
        price: "69.90",
        images: ['/assets/images/products/ring1.jpg'],
        categoryId: 4,
        stock: 5,
        isNew: false,
        isBestSeller: false,
        isLimited: true,
        metadata: {}
      }
    ];
    
    for (const product of products) {
      this.createProduct(product);
    }
    
    // Create admin user
    this.createUser({
      email: 'admin@drbijuteria.com',
      password: '$2a$10$ePkq71KKLU.vTJGdm/chJuXbZwkWJjxJI0wCZuSMWGeiZLRxrpsRy', // 'admin123'
      name: 'Admin DR Bijuteria',
      role: 'admin',
      address: null,
      phone: null,
      stripeCustomerId: null
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }
  
  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.resetToken === token);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const newUser: User = { 
      ...user, 
      id, 
      createdAt: now,
      profileImage: null,
      resetToken: null,
      resetTokenExpiry: null,
      stripeCustomerId: null,
      language: user.language || 'pt-PT'
    };
    this.users.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error('User not found');
    
    const updatedUser = { 
      ...user, 
      ...data
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserPassword(id: number, password: string): Promise<User> {
    return this.updateUser(id, { password });
  }
  
  async updateUserProfileImage(id: number, imageUrl: string): Promise<User> {
    return this.updateUser(id, { profileImage: imageUrl });
  }
  
  async createPasswordResetToken(email: string): Promise<string | null> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }
    
    const token = Math.random().toString(36).substring(2, 15) + 
                 Math.random().toString(36).substring(2, 15);
    
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token válido por 1 hora
    
    const updatedUser = { 
      ...user, 
      resetToken: token,
      resetTokenExpiry 
    };
    
    this.users.set(user.id, updatedUser);
    return token;
  }
  
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.getUserByResetToken(token);
    if (!user || !user.resetTokenExpiry) {
      return false;
    }
    
    // Verifica se o token expirou
    if (new Date() > user.resetTokenExpiry) {
      return false;
    }
    
    const updatedUser = { 
      ...user, 
      password: newPassword,
      resetToken: null,
      resetTokenExpiry: null
    };
    
    this.users.set(user.id, updatedUser);
    return true;
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
    const newCategory: Category = { ...category, id, description: category.description || null };
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
      description: product.description || null,
      images: product.images || null,
      categoryId: product.categoryId || null,
      inventory: product.stock || null,
      isNew: product.isNew || null,
      isBestSeller: product.isBestSeller || null,
      isLimited: product.isLimited || null,
      createdAt: now,
      updatedAt: now
    };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, data: Partial<Product>): Promise<Product> {
    const product = await this.getProduct(id);
    if (!product) throw new Error('Product not found');
    
    const updatedProduct = { 
      ...product, 
      ...data,
      updatedAt: new Date() 
    };
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
      quantity: cartItem.quantity || 1,
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
      status: order.status || 'pending',
      userId: order.userId || null,
      stripePaymentIntentId: order.stripePaymentIntentId || null,
      total: order.total || "0",
      shipping: order.shipping || {},
      createdAt: now,
      updatedAt: now
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
    const orders = Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    
    return Promise.all(orders.map(async order => {
      const orderWithItems = await this.getOrder(order.id);
      return orderWithItems!;
    }));
  }
  
  async getAllOrders(): Promise<(Order & { user: Omit<User, 'password'>, items: (OrderItem & { product: Product })[] })[]> {
    const orders = Array.from(this.orders.values())
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    
    return Promise.all(orders.map(async order => {
      const orderWithItems = await this.getOrder(order.id);
      if (!orderWithItems) throw new Error('Order not found');
      
      const user = this.users.get(order.userId || 0);
      if (!user) throw new Error('User not found');
      
      const { password, ...userWithoutPassword } = user;
      
      return {
        ...orderWithItems,
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
      createdAt: now,
      confirmedAt: null
    };
    this.newsletterSubscribers.set(id, newSubscriber);
    return newSubscriber;
  }
  
  async getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return Array.from(this.newsletterSubscribers.values());
  }
}

// Exporta a instância de armazenamento
export const storage = new MemStorage();