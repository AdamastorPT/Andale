import { Link } from 'wouter';
import { Instagram, Facebook, Pinterest, Twitter, ArrowRight, Send, MapPin, Phone, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

// Schema for newsletter form
const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

const Footer = () => {
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });
  
  const onSubmit = async (data: NewsletterFormData) => {
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
        title: 'Success!',
        description: 'Thank you for subscribing to our newsletter.',
      });
      
      reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
      });
    }
  };
  
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  return (
    <footer className="bg-black text-white">
      {/* Pre-footer section with newsletter */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-left"
            >
              <h3 className="font-serif text-2xl md:text-3xl mb-4">Join Our Community</h3>
              <p className="text-medium-gray mb-2 max-w-md">
                Subscribe to our newsletter to receive special offers, new product alerts, and exclusive insights into the world of fine Portuguese jewelry.
              </p>
              <div className="flex items-center space-x-4 mt-6">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-10 hover:bg-opacity-20 transition-all p-2.5 rounded-full text-white" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-10 hover:bg-opacity-20 transition-all p-2.5 rounded-full text-white" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-10 hover:bg-opacity-20 transition-all p-2.5 rounded-full text-white" aria-label="Pinterest">
                  <Pinterest className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-white bg-opacity-10 hover:bg-opacity-20 transition-all p-2.5 rounded-full text-white" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className={`w-full px-6 py-4 pr-14 bg-white bg-opacity-5 border border-gray-700 focus:border-pastel-rose rounded-full text-white placeholder-medium-gray focus:outline-none transition-all ${errors.email ? 'border-red-400' : ''}`}
                  {...register('email')}
                />
                <button 
                  type="submit" 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pastel-rose text-black p-2 rounded-full hover:bg-opacity-90 transition-all"
                  disabled={isSubmitting}
                  aria-label="Subscribe"
                >
                  {isSubmitting ? (
                    <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
                {errors.email && (
                  <p className="text-red-400 text-xs mt-2 ml-2">{errors.email.message}</p>
                )}
                <p className="text-xs text-medium-gray mt-3 ml-2">
                  By subscribing, you agree to our Privacy Policy and consent to receive updates from DRBijuteria.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <h3 className="font-serif text-3xl font-bold tracking-wider mb-6">DRBijuteria</h3>
            </Link>
            <p className="text-medium-gray mb-6 max-w-md">
              Handcrafted Portuguese jewelry combining traditional craftsmanship with contemporary design. Each piece tells a story of Portuguese heritage and artisanal excellence.
            </p>
            <div className="space-y-3 text-medium-gray">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-0.5 text-pastel-rose" />
                <p>Rua Augusta 123, 1100-053<br />Lisboa, Portugal</p>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-pastel-rose" />
                <p>+351 123 456 789</p>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-pastel-rose" />
                <p>info@drbijuteria.com</p>
              </div>
            </div>
          </div>
          
          {/* Shop links */}
          <div>
            <h4 className="uppercase text-sm font-medium tracking-wider mb-6 pb-2 border-b border-gray-800">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/category/all" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/category/earrings" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Earrings
                </Link>
              </li>
              <li>
                <Link href="/category/necklaces" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Necklaces
                </Link>
              </li>
              <li>
                <Link href="/category/bracelets" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Bracelets
                </Link>
              </li>
              <li>
                <Link href="/category/rings" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Rings
                </Link>
              </li>
              <li>
                <Link href="/category/new-arrivals" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company links */}
          <div>
            <h4 className="uppercase text-sm font-medium tracking-wider mb-6 pb-2 border-b border-gray-800">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/stores" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Our Stores
                </Link>
              </li>
              <li>
                <Link href="/sustainability" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Customer service links */}
          <div>
            <h4 className="uppercase text-sm font-medium tracking-wider mb-6 pb-2 border-b border-gray-800">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-medium-gray hover:text-white hover:pl-1 transition-all duration-200 inline-block">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
                
        {/* Copyright and payment methods */}
        <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-medium-gray text-sm">&copy; {new Date().getFullYear()} DRBijuteria. All rights reserved.</p>
          
          <div className="mt-6 md:mt-0 flex flex-col sm:flex-row items-center">
            <div className="text-medium-gray text-sm mr-4">We accept:</div>
            <div className="flex items-center mt-3 sm:mt-0">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-7 inline-block mx-2 grayscale hover:grayscale-0 transition-all duration-300" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 inline-block mx-2 grayscale hover:grayscale-0 transition-all duration-300" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 inline-block mx-2 grayscale hover:grayscale-0 transition-all duration-300" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" className="h-6 inline-block mx-2 grayscale hover:grayscale-0 transition-all duration-300" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
