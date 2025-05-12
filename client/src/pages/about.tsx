import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

const AboutPage = () => {
  return (
    <>
      <Helmet>
        <title>About Us | DRBijuteria</title>
        <meta name="description" content="Learn about DRBijuteria - our story, craftsmanship, and commitment to quality Portuguese jewelry." />
      </Helmet>
    
      {/* Hero Section */}
      <section className="relative h-[50vh] overflow-hidden">
        {/* Elegant jewelry workshop with artisans creating fine pieces */}
        <img 
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080" 
          alt="Jewelry workshop" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white max-w-3xl px-4">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight">Our Story</h1>
            <p className="text-sm md:text-base">
              Crafting timeless Portuguese jewelry since 2005
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-6">A Passion for Craftsmanship</h2>
            <p className="text-medium-gray leading-relaxed">
              Founded in 2005 in the heart of Porto, Portugal, DRBijuteria began as a small family-owned workshop dedicated to preserving the rich tradition of Portuguese jewelry craftsmanship. Our founder, Diana Ribeiro, envisioned a brand that would marry centuries-old techniques with contemporary designs, creating pieces that would be treasured for generations.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Jewelry artisan working" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="font-serif text-2xl mb-4">Handcrafted Excellence</h3>
              <p className="text-medium-gray mb-6 leading-relaxed">
                Each piece of DRBijuteria jewelry is meticulously handcrafted by our skilled artisans, many of whom have inherited their craft through generations. We take pride in the slow, deliberate process that ensures every detail is perfect.
              </p>
              <p className="text-medium-gray leading-relaxed">
                Our commitment to quality means we never rush production or compromise on materials. We believe that truly exceptional jewelry requires time, patience, and dedication—values that are increasingly rare in today's fast-paced world.
              </p>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 md:order-1"
            >
              <h3 className="font-serif text-2xl mb-4">Ethically Sourced Materials</h3>
              <p className="text-medium-gray mb-6 leading-relaxed">
                We believe that beautiful jewelry shouldn't come at a cost to our planet or communities. That's why we're committed to sourcing our materials ethically and sustainably. Our gold, silver, and gemstones are carefully selected from suppliers who share our values.
              </p>
              <p className="text-medium-gray leading-relaxed">
                By choosing DRBijuteria, you're not only acquiring a piece of exceptional jewelry but also supporting responsible practices that protect both people and the environment for generations to come.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 md:order-2"
            >
              <img 
                src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="Ethically sourced materials" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Our Values Section */}
      <section className="py-16 px-4 bg-soft-gray">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Our Values</h2>
            <p className="text-medium-gray max-w-2xl mx-auto">
              At DRBijuteria, our core values guide everything we do—from design and craftsmanship to customer service and business practices.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-serif text-xl mb-4">Quality</h3>
              <p className="text-medium-gray">
                We never compromise on excellence. Each piece undergoes rigorous quality control to ensure it meets our exacting standards.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-serif text-xl mb-4">Tradition</h3>
              <p className="text-medium-gray">
                We honor and preserve traditional Portuguese jewelry-making techniques while innovating for the contemporary world.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <h3 className="font-serif text-xl mb-4">Sustainability</h3>
              <p className="text-medium-gray">
                We are committed to ethical practices, from responsibly sourced materials to eco-friendly packaging and fair labor practices.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Our Team</h2>
            <p className="text-medium-gray max-w-2xl mx-auto">
              Behind every DRBijuteria piece is a team of passionate artisans, designers, and professionals who share a common dedication to exceptional craftsmanship.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300" 
                alt="Diana Ribeiro - Founder" 
                className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
              />
              <h3 className="font-serif text-xl mb-1">Diana Ribeiro</h3>
              <p className="text-medium-gray mb-2">Founder & Creative Director</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <img 
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300" 
                alt="Miguel Costa - Master Craftsman" 
                className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
              />
              <h3 className="font-serif text-xl mb-1">Miguel Costa</h3>
              <p className="text-medium-gray mb-2">Master Craftsman</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <img 
                src="https://images.unsplash.com/photo-1569913486515-b74bf7751574?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300" 
                alt="Sofia Oliveira - Lead Designer" 
                className="w-32 h-32 object-cover rounded-full mx-auto mb-4"
              />
              <h3 className="font-serif text-xl mb-1">Sofia Oliveira</h3>
              <p className="text-medium-gray mb-2">Lead Designer</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-pastel-rose bg-opacity-20">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-6">What Our Customers Say</h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <p className="italic text-medium-gray mb-4">
                "My DRBijuteria necklace has become my signature piece. The craftsmanship is exceptional, and I receive compliments every time I wear it. Truly a worthwhile investment."
              </p>
              <p className="font-medium">Mariana S.</p>
              <p className="text-sm text-medium-gray">Lisbon, Portugal</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <p className="italic text-medium-gray mb-4">
                "I gifted my wife a pair of earrings from DRBijuteria for our anniversary, and she was speechless. The attention to detail and elegant packaging made it a perfect present."
              </p>
              <p className="font-medium">João M.</p>
              <p className="text-sm text-medium-gray">Porto, Portugal</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Visit Us Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Visit Our Showroom</h2>
            <p className="text-medium-gray max-w-2xl mx-auto mb-8">
              Experience the elegance of DRBijuteria in person. Visit our flagship showroom in Porto to explore our full collection and meet our artisans.
            </p>
            <div className="bg-soft-gray p-6 inline-block rounded-lg">
              <p className="font-medium mb-1">DRBijuteria Flagship Store</p>
              <p className="text-medium-gray mb-1">Rua das Flores, 123</p>
              <p className="text-medium-gray mb-1">4050-262 Porto, Portugal</p>
              <p className="text-medium-gray mb-4">+351 912 345 678</p>
              <p className="font-medium mb-1">Hours</p>
              <p className="text-medium-gray mb-1">Monday - Friday: 10am - 7pm</p>
              <p className="text-medium-gray">Saturday: 10am - 6pm</p>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
