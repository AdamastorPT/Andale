import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Category } from '@shared/schema';
import { ArrowRight, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

// Components
import ProductGrid from '@/components/products/ProductGrid';
import { Helmet } from 'react-helmet';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Newsletter form schema
const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

const Home = () => {
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema)
  });

  // Fetch categories 
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/categories');
      return res.json();
    }
  });

  const onSubmitNewsletter = async (data: NewsletterFormData) => {
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to subscribe');
      }
      
      toast({
        title: 'Thank you for subscribing!',
        description: 'You have been added to our newsletter.',
      });
      
      reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Subscription failed',
        description: error.message || 'Something went wrong. Please try again.',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>DRBijuteria - Premium Portuguese Jewelry</title>
        <meta name="description" content="Discover our handcrafted collection of premium Portuguese jewelry. Elegant, timeless pieces made with the finest materials." />
        <meta property="og:title" content="DRBijuteria - Premium Portuguese Jewelry" />
        <meta property="og:description" content="Discover our handcrafted collection of premium Portuguese jewelry. Elegant, timeless pieces made with the finest materials." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://drbijuteria.com" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080" 
          alt="Luxury jewelry collection" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <motion.div 
            className="text-center text-white max-w-md px-4"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">Timeless Elegance</h1>
            <p className="text-sm md:text-base mb-8">Discover our handcrafted collection of premium Portuguese jewelry</p>
            <Link href="/category/all">
              <Button className="bg-white text-black hover:bg-white/90 px-8 py-6">
                SHOP NOW
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.h2 
            className="text-center font-serif text-3xl md:text-4xl mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Shop by Category
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories?.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/category/${category.slug}`}>
                  <div className="relative group overflow-hidden">
                    <img 
                      src={getCategoryImage(category.slug)} 
                      alt={`${category.name} Collection`} 
                      className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-10 group-hover:bg-opacity-20 transition-opacity duration-300 flex items-center justify-center">
                      <div className="text-center text-white">
                        <h3 className="font-serif text-2xl mb-1">{category.name}</h3>
                        <p className="text-sm uppercase tracking-widest">EXPLORE</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers Section */}
      <section className="py-16 px-4 bg-soft-gray">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Our Bestsellers</h2>
            <p className="text-medium-gray max-w-md mx-auto">
              Discover our most loved pieces, handcrafted with care using the finest materials
            </p>
          </motion.div>
          
          <ProductGrid showBestsellers limit={4} />
          
          <div className="text-center mt-12">
            <Link href="/category/best-sellers">
              <Button variant="outline" className="border border-black hover:bg-black hover:text-white transition-colors">
                VIEW ALL PRODUCTS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Collection Banner */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="relative h-[50vh] md:h-[60vh] overflow-hidden"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080" 
              alt="New Collection Display" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center">
              <div className="ml-8 md:ml-16 max-w-md text-white">
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4">Summer Collection 2023</h2>
                <p className="mb-6 md:mb-8">
                  Elevate your style with our latest collection of handcrafted pieces inspired by the warmth and vibrancy of summer.
                </p>
                <Link href="/category/new-arrivals">
                  <Button className="bg-white text-black hover:bg-white/90">
                    DISCOVER NOW
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Artisan jewelry crafting" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </motion.div>
            <motion.div 
              className="max-w-md mx-auto md:mx-0"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h4 className="uppercase tracking-widest text-medium-gray text-sm mb-2">Our Story</h4>
              <h2 className="font-serif text-3xl md:text-4xl mb-6">Handcrafted with Love and Passion</h2>
              <p className="mb-4 text-medium-gray">
                At DRBijuteria, every piece tells a story. Founded in 2005 in Porto, Portugal, our jewelry combines traditional Portuguese craftsmanship with contemporary design.
              </p>
              <p className="mb-8 text-medium-gray">
                We pride ourselves on using only the finest materials, ethically sourced and carefully selected to create timeless pieces that can be treasured for generations.
              </p>
              <Link href="/about">
                <span className="inline-block border-b border-black pb-1 font-medium hover:border-pastel-rose hover:text-pastel-rose transition-colors">
                  LEARN MORE ABOUT US <ArrowRight className="inline h-4 w-4 ml-1" />
                </span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-16 px-4 bg-soft-gray">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Follow Our Journey</h2>
            <p className="text-medium-gray max-w-md mx-auto">
              Join our community and follow us on Instagram for inspiration, behind-the-scenes content, and exclusive offers
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {instagramPosts.map((post, index) => (
              <motion.a
                key={index}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden group"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <img 
                  src={post.image} 
                  alt={post.alt} 
                  className="w-full aspect-square object-cover transform transition-transform duration-500 group-hover:scale-110"
                />
              </motion.a>
            ))}
          </div>

          <div className="text-center mt-8">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center text-medium-gray hover:text-black transition-colors"
            >
              <Instagram className="mr-2" />
              @drbijuteria
            </a>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-pastel-rose bg-opacity-20">
        <div className="container mx-auto">
          <motion.div
            className="max-w-md mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl mb-4">Join Our Community</h2>
            <p className="text-medium-gray mb-8">
              Subscribe to our newsletter to receive special offers, new product alerts, and exclusive insights into the world of DRBijuteria.
            </p>
            <form onSubmit={handleSubmit(onSubmitNewsletter)} className="flex flex-col sm:flex-row">
              <div className="flex-grow">
                <input
                  type="email"
                  placeholder="Your email address"
                  className={`w-full px-4 py-3 mb-3 sm:mb-0 sm:mr-2 focus:outline-none ${errors.email ? 'border-red-500' : ''}`}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 text-left">{errors.email.message}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="bg-black text-white hover:bg-black/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
              </Button>
            </form>
            <p className="text-xs text-medium-gray mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from DRBijuteria.
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
};

// Helper function to get category images
const getCategoryImage = (slug: string): string => {
  const categoryImages: Record<string, string> = {
    'earrings': 'https://pixabay.com/get/g601398d5d6c2510bdbcbfd6b465bb56ce8a515cb44fc67f299da54daf9cc747ef56b01812eb6096693e7fc7cb82596401d5f941d6ac2b3971e0a212a7d5186e5_1280.jpg',
    'necklaces': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=800',
    'bracelets': 'https://pixabay.com/get/g544d7e4da7fde568c349efba14ddb978fca55e2432d480f4cf35857340fcb1ee52ad55748d3e5df585a0e78cfafce95ddbb777acab1a78f003d39db38ea93035_1280.jpg',
    'rings': 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=800',
    // Default image if category not found
    'default': 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600'
  };
  
  return categoryImages[slug] || categoryImages.default;
};

// Instagram posts data
const instagramPosts = [
  {
    image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
    alt: 'Jewelry arrangement'
  },
  {
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
    alt: 'Model wearing jewelry'
  },
  {
    image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
    alt: 'Artisan crafting'
  },
  {
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
    alt: 'Jewelry store display'
  },
  {
    image: 'https://images.unsplash.com/photo-1592492152545-9695d3f473f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
    alt: 'Wedding rings'
  },
  {
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300',
    alt: 'Jewelry packaging'
  }
];

export default Home;
