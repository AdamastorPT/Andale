import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { 
  insertUserSchema, 
  loginUserSchema, 
  insertCartItemSchema,
  insertNewsletterSubscriberSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertWishlistItemSchema,
  insertArticleSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  updateProfileSchema
} from "@shared/schema";

// Ensure the STRIPE_SECRET_KEY environment variable is set
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing STRIPE_SECRET_KEY environment variable, some functionality may not work');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
}) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Middleware
  const authenticateUser = async (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'Authentication required' });
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  };

  // Admin Middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Admin access required' });
    }
  };

  // AUTHENTICATION ROUTES
  
  // Register
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const newUser = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Generate JWT
      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET || 'dev_secret',
        { expiresIn: '7d' }
      );
      
      // Return user (without password) and token
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'dev_secret',
        { expiresIn: '7d' }
      );
      
      // Return user (without password) and token
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get current user
  app.get('/api/auth/me', authenticateUser, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // PRODUCT ROUTES
  
  // Get all products
  app.get('/api/products', async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get product by ID
  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      res.json(product);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // CATEGORY ROUTES
  
  // Get all categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get products by category
  app.get('/api/categories/:slug/products', async (req, res) => {
    try {
      const { slug } = req.params;
      const products = await storage.getProductsByCategory(slug);
      res.json(products);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // CART ROUTES
  
  // Get user cart
  app.get('/api/cart', authenticateUser, async (req: any, res) => {
    try {
      const cartItems = await storage.getCartByUserId(req.user.id);
      res.json(cartItems);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Add item to cart
  app.post('/api/cart', authenticateUser, async (req: any, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update cart item quantity
  app.patch('/api/cart/:id', authenticateUser, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = z.object({ quantity: z.number().min(1) }).parse(req.body);
      
      // Verify cart item belongs to user
      const cartItem = await storage.getCartItem(id);
      if (!cartItem || cartItem.userId !== req.user.id) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      
      const updatedCartItem = await storage.updateCartItemQuantity(id, quantity);
      res.json(updatedCartItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Remove item from cart
  app.delete('/api/cart/:id', authenticateUser, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify cart item belongs to user
      const cartItem = await storage.getCartItem(id);
      if (!cartItem || cartItem.userId !== req.user.id) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      
      await storage.removeFromCart(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Clear cart
  app.delete('/api/cart', authenticateUser, async (req: any, res) => {
    try {
      await storage.clearCart(req.user.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // CHECKOUT ROUTES
  
  // Create payment intent
  app.post('/api/create-payment-intent', authenticateUser, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Stripe not configured' });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Get cart items
      const cartItems = await storage.getCartByUserId(user.id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }
      
      // Calculate total
      const amount = cartItems.reduce((total, item) => {
        return total + (Number(item.product.price) * item.quantity);
      }, 0);
      
      // Create or retrieve Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: user.name || undefined,
        });
        customerId = customer.id;
        await storage.updateStripeCustomerId(user.id, customerId);
      }
      
      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'eur',
        customer: customerId,
        metadata: {
          userId: user.id.toString()
        }
      });
      
      res.json({
        clientSecret: paymentIntent.client_secret,
        amount
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Process successful payment (webhook)
  app.post('/api/webhook', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Stripe not configured' });
      }
      
      const signature = req.headers['stripe-signature'] as string;
      
      // Verify webhook signature
      if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.warn('STRIPE_WEBHOOK_SECRET not set, skipping signature verification');
      } else {
        try {
          const event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
          );
          
          if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const userId = parseInt(paymentIntent.metadata.userId);
            
            if (userId) {
              // Get user cart
              const cartItems = await storage.getCartByUserId(userId);
              
              // Create order
              const order = await storage.createOrder({
                userId,
                stripePaymentIntentId: paymentIntent.id,
                status: 'paid',
                total: Number(paymentIntent.amount) / 100,
                shipping: {}
              });
              
              // Create order items
              for (const item of cartItems) {
                await storage.createOrderItem({
                  orderId: order.id,
                  productId: item.productId,
                  quantity: item.quantity,
                  price: Number(item.product.price)
                });
              }
              
              // Clear cart
              await storage.clearCart(userId);
            }
          }
        } catch (err) {
          console.error('Webhook signature verification failed', err);
          return res.status(400).send('Webhook signature verification failed');
        }
      }
      
      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ORDER ROUTES
  
  // Get user orders
  app.get('/api/orders', authenticateUser, async (req: any, res) => {
    try {
      const orders = await storage.getOrdersByUserId(req.user.id);
      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get order by ID
  app.get('/api/orders/:id', authenticateUser, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order || order.userId !== req.user.id) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // NEWSLETTER ROUTES
  
  // Subscribe to newsletter
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const { email } = insertNewsletterSubscriberSchema.parse(req.body);
      
      // Check if already subscribed
      const existingSubscriber = await storage.getNewsletterSubscriberByEmail(email);
      if (existingSubscriber) {
        return res.status(400).json({ message: 'Email already subscribed' });
      }
      
      const subscriber = await storage.createNewsletterSubscriber({ email });
      res.status(201).json(subscriber);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // ADMIN ROUTES
  
  // Get all users (admin only)
  app.get('/api/admin/users', authenticateUser, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all orders (admin only)
  app.get('/api/admin/orders', authenticateUser, isAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all newsletter subscribers (admin only)
  app.get('/api/admin/newsletter', authenticateUser, isAdmin, async (req, res) => {
    try {
      const subscribers = await storage.getAllNewsletterSubscribers();
      res.json(subscribers);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // PROFILE ROUTES
  
  // Update user profile
  app.patch('/api/profile', authenticateUser, async (req: any, res) => {
    try {
      const userData = updateProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUser(req.user.id, userData);
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Update profile image
  app.post('/api/profile/image', authenticateUser, async (req: any, res) => {
    try {
      const { imageUrl } = z.object({ imageUrl: z.string().url() }).parse(req.body);
      const updatedUser = await storage.updateUserProfileImage(req.user.id, imageUrl);
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Update user password
  app.post('/api/profile/password', authenticateUser, async (req: any, res) => {
    try {
      const { password, confirmPassword } = updatePasswordSchema.parse(req.body);
      
      // Hash novo password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const updatedUser = await storage.updateUserPassword(req.user.id, hashedPassword);
      
      const { password: _, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Request password reset
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = resetPasswordSchema.parse(req.body);
      const token = await storage.createPasswordResetToken(email);
      
      if (!token) {
        // Não revelamos se o email existe ou não por segurança
        return res.json({ message: 'Se o email existir, um link de redefinição será enviado' });
      }
      
      // Aqui seria implementado o envio real de email
      // Para fins de demonstração, vamos apenas retornar o token
      res.json({ 
        message: 'Link de redefinição enviado',
        token: `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${token}`
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Reset password with token
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = z.object({
        token: z.string(),
        password: z.string().min(6)
      }).parse(req.body);
      
      // Hash novo password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const success = await storage.resetPassword(token, hashedPassword);
      
      if (!success) {
        return res.status(400).json({ message: 'Token inválido ou expirado' });
      }
      
      res.json({ message: 'Senha redefinida com sucesso' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // WISHLIST ROUTES
  
  // Get user wishlist
  app.get('/api/wishlist', authenticateUser, async (req: any, res) => {
    try {
      const wishlistItems = await storage.getWishlistByUserId(req.user.id);
      res.json(wishlistItems);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Add to wishlist
  app.post('/api/wishlist', authenticateUser, async (req: any, res) => {
    try {
      const wishlistItemData = insertWishlistItemSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const wishlistItem = await storage.addToWishlist(wishlistItemData);
      res.status(201).json(wishlistItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Remove from wishlist
  app.delete('/api/wishlist/:id', authenticateUser, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Verify wishlist item belongs to user
      const wishlistItem = await storage.getWishlistItem(id);
      if (!wishlistItem || wishlistItem.userId !== req.user.id) {
        return res.status(404).json({ message: 'Item não encontrado na lista de desejos' });
      }
      
      await storage.removeFromWishlist(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Check if product is in wishlist
  app.get('/api/wishlist/check/:productId', authenticateUser, async (req: any, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const isInWishlist = await storage.isProductInWishlist(req.user.id, productId);
      
      res.json({ isInWishlist });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // ARTICLE ROUTES
  
  // Get all articles
  app.get('/api/articles', async (req, res) => {
    try {
      const publishedOnly = req.query.published === 'true';
      const articles = await storage.getAllArticles(publishedOnly);
      res.json(articles);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Get article by slug
  app.get('/api/articles/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getArticleBySlug(slug);
      
      if (!article) {
        return res.status(404).json({ message: 'Artigo não encontrado' });
      }
      
      // Só retorna artigos publicados para o público
      if (!article.published && (!req.user || req.user.role !== 'admin')) {
        return res.status(404).json({ message: 'Artigo não encontrado' });
      }
      
      res.json(article);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // ADMIN ARTICLE ROUTES
  
  // Create article (admin only)
  app.post('/api/admin/articles', authenticateUser, isAdmin, async (req: any, res) => {
    try {
      const articleData = insertArticleSchema.parse({
        ...req.body,
        authorId: req.user.id
      });
      
      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Update article (admin only)
  app.patch('/api/admin/articles/:id', authenticateUser, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      
      if (!article) {
        return res.status(404).json({ message: 'Artigo não encontrado' });
      }
      
      const updatedArticle = await storage.updateArticle(id, req.body);
      res.json(updatedArticle);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  
  // Publish article (admin only)
  app.post('/api/admin/articles/:id/publish', authenticateUser, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      
      if (!article) {
        return res.status(404).json({ message: 'Artigo não encontrado' });
      }
      
      const publishedArticle = await storage.publishArticle(id);
      res.json(publishedArticle);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update product metadata (admin only)
  app.patch('/api/admin/products/:id', authenticateUser, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isNew, isBestSeller, isLimited, categoryId } = req.body;
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      const updatedProduct = await storage.updateProductMetadata(id, {
        isNew: isNew !== undefined ? isNew : product.isNew,
        isBestSeller: isBestSeller !== undefined ? isBestSeller : product.isBestSeller,
        isLimited: isLimited !== undefined ? isLimited : product.isLimited,
        categoryId: categoryId !== undefined ? categoryId : product.categoryId
      });
      
      res.json(updatedProduct);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe webhook endpoint to sync products
  app.post('/api/stripe/sync-products', async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Stripe not configured' });
      }
      
      // Get all products from Stripe
      const stripeProducts = await stripe.products.list({ active: true, expand: ['data.default_price'] });
      
      // Sync each product
      for (const stripeProduct of stripeProducts.data) {
        const price = stripeProduct.default_price as Stripe.Price;
        if (!price || typeof price === 'string' || !price.unit_amount) continue;
        
        // Check if product already exists in our database
        const existingProduct = await storage.getProductByStripeId(stripeProduct.id);
        
        if (existingProduct) {
          // Update existing product
          await storage.updateProduct(existingProduct.id, {
            name: stripeProduct.name,
            description: stripeProduct.description || '',
            price: price.unit_amount / 100,
            images: stripeProduct.images || [],
            metadata: stripeProduct.metadata || {}
          });
        } else {
          // Create new product
          await storage.createProduct({
            stripeId: stripeProduct.id,
            name: stripeProduct.name,
            description: stripeProduct.description || '',
            price: price.unit_amount / 100,
            images: stripeProduct.images || [],
            metadata: stripeProduct.metadata || {}
          });
        }
      }
      
      res.json({ success: true, message: 'Products synced successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
