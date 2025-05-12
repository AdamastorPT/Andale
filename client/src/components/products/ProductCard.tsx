import { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { Product } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type ProductCardProps = {
  product: Product;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addItem } = useCartStore();
  const { toast } = useToast();
  
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
    
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  return (
    <div 
      className="bg-white product-card group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.id}`}>
        <div className="relative overflow-hidden">
          {/* Product image */}
          <img 
            src={product.images && product.images.length > 0 ? product.images[0] : 'https://placehold.co/600x800?text=No+Image'} 
            alt={product.name} 
            className="w-full h-80 object-cover product-image"
          />
          
          {/* Product badges */}
          <div className="absolute top-0 left-0 m-3 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-pastel-rose px-2 py-1 text-xs uppercase">New</span>
            )}
            {product.isBestSeller && (
              <span className="bg-pastel-rose px-2 py-1 text-xs uppercase">Bestseller</span>
            )}
            {product.isLimited && (
              <span className="bg-pastel-rose px-2 py-1 text-xs uppercase">Limited Edition</span>
            )}
          </div>
          
          {/* Quick actions */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-4 bg-white bg-opacity-90"
            initial={{ y: '100%' }}
            animate={{ y: isHovered ? 0 : '100%' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between">
              <button className="text-black hover:text-pastel-rose">
                <Heart className="h-4 w-4 mr-1 inline" /> Add to Wishlist
              </button>
              <button className="text-black hover:text-pastel-rose">
                <Eye className="h-4 w-4 mr-1 inline" /> Quick View
              </button>
            </div>
          </motion.div>
        </div>
        
        <div className="p-4">
          <h3 className="font-serif text-lg mb-1">{product.name}</h3>
          <p className="text-medium-gray text-sm mb-3">{product.description ? product.description.substring(0, 50) : ''}</p>
          <div className="flex justify-between items-center">
            <span className="font-medium">€{Number(product.price).toFixed(2)}</span>
            <Button 
              onClick={handleAddToCart}
              className="bg-black text-white px-4 py-2 text-sm hover:bg-black/90"
            >
              <ShoppingBag className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
