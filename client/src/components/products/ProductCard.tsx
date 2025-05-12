import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCartStore();
  const { toast } = useToast();
  
  // Use the first image by default or show a placeholder
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : ['https://placehold.co/600x800?text=No+Image'];
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: Date.now(), // Temporary ID for local cart
      productId: product.id,
      quantity: 1,
      product: {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        images: product.images || []
      }
    });
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  // Handle image switching on hover for products with multiple images
  const handleMouseEnter = () => {
    setIsHovered(true);
    
    // If product has multiple images, setup interval to cycle through them
    if (productImages.length > 1) {
      const interval = setInterval(() => {
        setImageIndex((prev) => (prev + 1) % productImages.length);
      }, 2000);
      
      // Store interval ID for cleanup
      return () => clearInterval(interval);
    }
  };
  
  return (
    <motion.div 
      className="bg-white product-card group relative rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          {/* Product image with image switching on hover */}
          <AnimatePresence mode="wait">
            <motion.img 
              key={imageIndex}
              src={productImages[imageIndex]} 
              alt={product.name} 
              className="w-full h-80 object-cover product-image"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0.8 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
          
          {/* Image indicators for multiple images */}
          {productImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-1">
              {productImages.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === imageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60'}`}
                />
              ))}
            </div>
          )}
          
          {/* Product badges - enhanced with slight opacity and better positioning */}
          <div className="absolute top-0 left-0 p-3 flex flex-col gap-2 z-10">
            {product.isNew && (
              <span className="bg-black text-white text-xs uppercase tracking-wide px-2.5 py-1 rounded-sm font-medium">New</span>
            )}
            {product.isBestSeller && (
              <span className="bg-pastel-rose text-black text-xs uppercase tracking-wide px-2.5 py-1 rounded-sm font-medium flex items-center">
                <Star className="h-3 w-3 mr-1 inline" fill="currentColor" stroke="none" />
                Bestseller
              </span>
            )}
            {product.isLimited && (
              <span className="bg-white/80 backdrop-blur-sm text-black text-xs uppercase tracking-wide px-2.5 py-1 rounded-sm font-medium">Limited</span>
            )}
          </div>
          
          {/* Quick actions overlay */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-3 bg-white bg-opacity-95 backdrop-blur-sm border-t border-light-gray"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: isHovered ? 0 : '100%', opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="flex justify-between gap-2">
              <button 
                className="text-black hover:text-pastel-rose text-xs uppercase tracking-wide flex items-center bg-soft-gray px-3 py-2 rounded-sm flex-1 justify-center transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast({
                    title: 'Added to wishlist',
                    description: `${product.name} has been added to your wishlist.`,
                  });
                }}
              >
                <Heart className="h-3.5 w-3.5 mr-1.5" /> Wishlist
              </button>
              <button 
                className="text-black hover:text-pastel-rose text-xs uppercase tracking-wide flex items-center bg-soft-gray px-3 py-2 rounded-sm flex-1 justify-center transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Quick view functionality would go here
                }}
              >
                <Eye className="h-3.5 w-3.5 mr-1.5" /> Quick View
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Product details with improved typography and spacing */}
        <div className="p-5">
          <div className="mb-3">
            {/* Category tag if available */}
            {product.categoryId && (
              <span className="text-medium-gray text-xs uppercase tracking-wider mb-1 block">
                {getCategoryName(product.categoryId)}
              </span>
            )}
            <h3 className="font-serif text-lg font-medium mb-1 line-clamp-1">{product.name}</h3>
            {product.description && (
              <p className="text-medium-gray text-sm line-clamp-2 h-10">
                {product.description}
              </p>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium text-lg">€{Number(product.price).toFixed(2)}</span>
              {/* Show a fake original price for products marked as new for better sales presentation */}
              {product.isNew && (
                <span className="text-medium-gray text-sm line-through ml-2">
                  €{(Number(product.price) * 1.15).toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Add to cart button with animation */}
            <AnimatePresence mode="wait">
              {addedToCart ? (
                <motion.div
                  key="added"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-green-500 text-white rounded-full p-2.5"
                >
                  <Check className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.button
                  key="add"
                  onClick={handleAddToCart}
                  className="bg-black text-white rounded-full p-2.5 hover:bg-black/90 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingBag className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Helper function to get category name from ID
const getCategoryName = (categoryId: number): string => {
  const categoryMap: Record<number, string> = {
    1: 'Earrings',
    2: 'Necklaces',
    3: 'Bracelets',
    4: 'Rings',
    // Add more mappings as needed
  };
  
  return categoryMap[categoryId] || 'Jewelry';
};

export default ProductCard;
