import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Helmet } from 'react-helmet';

// Contact form schema
const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(2, 'Please enter a subject'),
  message: z.string().min(10, 'Please enter a message (minimum 10 characters)')
});

type ContactFormData = z.infer<typeof contactSchema>;

const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema)
  });
  
  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      
      // Simulate form submission - in production this would be a real API call
      // to a backend endpoint that sends an email or stores the contact request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Message Sent',
        description: 'Thank you for contacting us. We\'ll get back to you soon!',
      });
      
      setIsSubmitted(true);
      reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <title>Contact Us | DRBijuteria</title>
        <meta name="description" content="Contact DRBijuteria - get in touch with our team for any questions about our jewelry collection, custom orders, or assistance." />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative h-[40vh] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=800" 
          alt="Premium jewelry display" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white max-w-3xl px-4">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">Contact Us</h1>
            <p className="text-sm md:text-base">
              We'd love to hear from you. Get in touch with our team.
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Form Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-soft-gray p-8 rounded-lg"
            >
              <h2 className="font-serif text-3xl mb-6">Get In Touch</h2>
              <p className="text-medium-gray mb-8">
                Have questions about our products, custom orders, or need assistance? Our team is here to help. Reach out to us using any of the contact methods below.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="mr-4 bg-white p-3 rounded-full shadow-sm">
                    <Mail className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Email Us</h3>
                    <p className="text-medium-gray">info@drbijuteria.com</p>
                    <p className="text-medium-gray">sales@drbijuteria.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 bg-white p-3 rounded-full shadow-sm">
                    <Phone className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Call Us</h3>
                    <p className="text-medium-gray">+351 912 345 678</p>
                    <p className="text-medium-gray">Monday - Friday: 9am - 6pm</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-4 bg-white p-3 rounded-full shadow-sm">
                    <MapPin className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-1">Visit Our Store</h3>
                    <p className="text-medium-gray">Rua das Flores, 123</p>
                    <p className="text-medium-gray">4050-262 Porto, Portugal</p>
                    <p className="text-medium-gray mt-2">
                      <span className="font-medium">Hours:</span><br />
                      Monday - Friday: 10am - 7pm<br />
                      Saturday: 10am - 6pm<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-12 border-t border-gray-300">
                <h3 className="font-medium text-lg mb-4">Connect With Us</h3>
                <div className="flex space-x-4">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white p-3 rounded-full shadow-sm hover:bg-pastel-rose transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white p-3 rounded-full shadow-sm hover:bg-pastel-rose transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  </a>
                  <a 
                    href="https://pinterest.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white p-3 rounded-full shadow-sm hover:bg-pastel-rose transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 12a4 4 0 0 1 8 0c0 2.5-2.5 4-4 5.5C10.5 16 8 14.5 8 12Z"></path>
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
            
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-3xl mb-6">Send Us a Message</h2>
              
              {isSubmitted ? (
                <div className="bg-pastel-rose bg-opacity-20 p-8 rounded-lg text-center">
                  <div className="w-16 h-16 bg-pastel-rose rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="font-serif text-2xl mb-4">Message Sent Successfully!</h3>
                  <p className="text-medium-gray mb-6">
                    Thank you for reaching out. We've received your message and will get back to you as soon as possible.
                  </p>
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    className="bg-black text-white hover:bg-black/90"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      {...register('name')}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register('email')}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="How can we help you?"
                      {...register('subject')}
                      className={errors.subject ? 'border-red-500' : ''}
                    />
                    {errors.subject && (
                      <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Your message..."
                      rows={6}
                      {...register('message')}
                      className={errors.message ? 'border-red-500' : ''}
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-black text-white hover:bg-black/90 w-full py-6"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 px-4 bg-soft-gray">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl mb-6">Find Us</h2>
            <p className="text-medium-gray max-w-2xl mx-auto">
              Visit our flagship store in the heart of Porto, where you can experience our jewelry collection in person and meet our team of dedicated artisans.
            </p>
          </motion.div>
          
          <div className="rounded-lg overflow-hidden shadow-lg h-[400px]">
            <iframe 
              title="DRBijuteria Store Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3004.454799112434!2d-8.616199!3d41.146053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2464e205e852b3%3A0xc798b8a9b5c93ae!2sRua%20das%20Flores%2C%20Porto%2C%20Portugal!5e0!3m2!1sen!2sus!4v1652889096584!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl mb-6">Frequently Asked Questions</h2>
            <p className="text-medium-gray max-w-2xl mx-auto">
              Find answers to common questions about our products, shipping, returns, and more.
            </p>
          </motion.div>
          
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-medium text-lg mb-2">Do you offer international shipping?</h3>
              <p className="text-medium-gray">
                Yes, we ship to most countries worldwide. International shipping typically takes 5-10 business days depending on the destination. Shipping fees vary based on location and will be calculated at checkout.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-medium text-lg mb-2">What is your return policy?</h3>
              <p className="text-medium-gray">
                We offer a 30-day return policy on all unworn items in their original condition and packaging. Custom orders and engraved pieces cannot be returned unless there is a manufacturing defect.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-medium text-lg mb-2">Do you offer jewelry repair services?</h3>
              <p className="text-medium-gray">
                Yes, we provide repair services for all our jewelry pieces. Please contact our customer service team for more information about repair options and pricing.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-medium text-lg mb-2">Can I order custom jewelry?</h3>
              <p className="text-medium-gray">
                Absolutely! We offer custom design services for special occasions such as engagements, weddings, and anniversaries. Please contact us directly to discuss your custom jewelry needs.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
