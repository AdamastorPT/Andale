import { Link } from 'wouter';
import { Instagram, Facebook, Linkedin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

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
  
  return (
    <footer className="bg-black text-white py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand section */}
          <div>
            <h3 className="font-serif text-xl mb-6">DRBijuteria</h3>
            <p className="text-medium-gray mb-6">
              Handcrafted Portuguese jewelry combining traditional craftsmanship with contemporary design.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pastel-rose" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pastel-rose" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pastel-rose" aria-label="Linkedin">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Shop links */}
          <div>
            <h4 className="uppercase text-sm font-medium mb-6">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/category/all" className="text-medium-gray hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/category/earrings" className="text-medium-gray hover:text-white transition-colors">
                  Earrings
                </Link>
              </li>
              <li>
                <Link href="/category/necklaces" className="text-medium-gray hover:text-white transition-colors">
                  Necklaces
                </Link>
              </li>
              <li>
                <Link href="/category/bracelets" className="text-medium-gray hover:text-white transition-colors">
                  Bracelets
                </Link>
              </li>
              <li>
                <Link href="/category/rings" className="text-medium-gray hover:text-white transition-colors">
                  Rings
                </Link>
              </li>
              <li>
                <Link href="/category/new-arrivals" className="text-medium-gray hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company links */}
          <div>
            <h4 className="uppercase text-sm font-medium mb-6">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-medium-gray hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/stores" className="text-medium-gray hover:text-white transition-colors">
                  Our Stores
                </Link>
              </li>
              <li>
                <Link href="/sustainability" className="text-medium-gray hover:text-white transition-colors">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-medium-gray hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-medium-gray hover:text-white transition-colors">
                  Press
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Customer service links */}
          <div>
            <h4 className="uppercase text-sm font-medium mb-6">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-medium-gray hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-medium-gray hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-medium-gray hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-medium-gray hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-medium-gray hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-medium-gray hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Newsletter section */}
        <div className="mt-12 pt-12 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center mb-12">
            <h3 className="font-serif text-xl mb-4">Join Our Community</h3>
            <p className="text-medium-gray mb-6">
              Subscribe to our newsletter to receive special offers, new product alerts, and exclusive insights.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row">
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
              <button 
                type="submit" 
                className="bg-white text-black px-6 py-3 font-medium hover:bg-opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
              </button>
            </form>
            <p className="text-xs text-medium-gray mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from DRBijuteria.
            </p>
          </div>
        </div>
        
        {/* Copyright and payment methods */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center md:text-left md:flex md:justify-between md:items-center">
          <p className="text-medium-gray text-sm">&copy; {new Date().getFullYear()} DRBijuteria. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex items-center justify-center md:justify-end">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-8 inline-block mx-1" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 inline-block mx-1" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 inline-block mx-1" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" className="h-6 inline-block mx-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
