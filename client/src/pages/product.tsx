import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Product as ProductType } from '@shared/schema';
import { useCartStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Minus, 
  Plus, 
  ChevronRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';

// Components
import ProductGrid from '@/components/products/ProductGrid';

const Product = () => {
  const { id } = useParams();
  const productId = parseInt(id);
  const { toast } = useToast();
  const { addItem } = useCartStore();
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  
  // Fetch product details
  const { data: product, isLoading, error } = useQuery<ProductType>({
    queryKey: [`/api/products/${productId}`],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/products/${productId}`);
      return res.json();
    },
    enabled: !isNaN(productId)
  });
  
  // Fetch category for this product
  const { data: categories } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/categories');
      return res.json();
    }
  });
  
  // Reset quantity when product changes
  useEffect(() => {
    setQuantity(1);
    setSelectedImage(0);
  }, [id]);
  
  const increaseQuantity = () => {
    if (product?.inventory && quantity < product.inventory) {
      setQuantity(quantity + 1);
    } else if (!product?.inventory) {
      setQuantity(quantity + 1);
    }
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (!product) return;
    
    addItem({
      id: Date.now(), // Temporary ID for local cart
      productId: product.id,
      quantity,
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
    
    // Show added animation
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };
  
  // Find category
  const category = product?.categoryId && categories
    ? categories.find((cat: any) => cat.id === product.categoryId)
    : null;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-serif text-3xl mb-4">Product Not Found</h1>
        <p className="text-medium-gray mb-8">Sorry, the product you're looking for doesn't exist or has been removed.</p>
        <Link href="/category/all">
          <Button>
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{product.name} | DRBijuteria</title>
        <meta name="description" content={product.description || `${product.name} - Premium jewelry from DRBijuteria's collection.`} />
        <meta property="og:title" content={`${product.name} | DRBijuteria`} />
        <meta property="og:description" content={product.description || `${product.name} - Premium jewelry from DRBijuteria's collection.`} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://drbijuteria.com/product/${product.id}`} />
        {product.images && product.images[0] && (
          <meta property="og:image" content={product.images[0]} />
        )}
      </Helmet>
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Breadcrumbs */}
        <div className="mb-6 text-sm text-medium-gray flex items-center">
          <Link href="/">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          
          {category && (
            <>
              <Link href={`/category/${category.slug}`}>{category.name}</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
            </>
          )}
          
          <span className="text-black truncate max-w-[200px]">{product.name}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Product Images */}
          <div>
            <div className="mb-4 overflow-hidden">
              <img 
                src={product.images?.[selectedImage] || 'https://placehold.co/600x800?text=No+Image'} 
                alt={product.name} 
                className="w-full h-auto object-cover"
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 border-2 ${selectedImage === index ? 'border-black' : 'border-transparent'}`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} view ${index + 1}`} 
                      className="w-20 h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Product badges */}
            <div className="flex gap-2 mb-4">
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
            
            <h1 className="font-serif text-3xl md:text-4xl mb-2">{product.name}</h1>
            <p className="text-2xl font-medium mb-6">€{Number(product.price).toFixed(2)}</p>
            
            <div className="mb-6">
              <p className="text-medium-gray">{product.description}</p>
            </div>
            
            {/* Inventory status */}
            {product.inventory !== undefined && product.inventory <= 5 && product.inventory > 0 && (
              <p className="mb-6 text-red-500 font-medium">
                Only {product.inventory} left in stock!
              </p>
            )}
            
            {/* Quantity selector */}
            <div className="mb-6">
              <p className="mb-2 font-medium">Quantity</p>
              <div className="flex items-center">
                <button 
                  onClick={decreaseQuantity} 
                  className="border border-light-gray w-10 h-10 flex items-center justify-center"
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 h-10 flex items-center justify-center font-medium">
                  {quantity}
                </span>
                <button 
                  onClick={increaseQuantity} 
                  className="border border-light-gray w-10 h-10 flex items-center justify-center"
                  disabled={product.inventory !== undefined && quantity >= product.inventory}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Add to cart button */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                className={`bg-black text-white hover:bg-black/90 px-8 py-6 flex-grow relative overflow-hidden ${
                  added ? 'add-to-cart-success' : ''
                }`}
                onClick={handleAddToCart}
                disabled={product.inventory === 0 || added}
              >
                <span className={`flex items-center justify-center transition-transform duration-300 ${
                  added ? 'translate-y-[-100%]' : 'translate-y-0'
                }`}>
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  ADD TO CART
                </span>
                <span className={`absolute inset-0 flex items-center justify-center transition-transform duration-300 ${
                  added ? 'translate-y-0' : 'translate-y-[100%]'
                }`}>
                  <Check className="mr-2 h-5 w-5" />
                  ADDED TO CART
                </span>
              </Button>
              
              <Button variant="outline" className="border-black">
                <Heart className="mr-2 h-5 w-5" />
                WISHLIST
              </Button>
            </div>
            
            {/* Extra details */}
            <div className="border-t border-light-gray pt-6 space-y-4">
              <div>
                <h3 className="font-medium mb-2">Share this product</h3>
                <div className="flex space-x-4">
                  <button className="text-medium-gray hover:text-black transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Product Details</h3>
                <ul className="list-disc list-inside text-medium-gray">
                  <li>Free shipping on orders over €100</li>
                  <li>30-day return policy</li>
                  <li>Handcrafted in Portugal</li>
                  <li>Comes in a luxury gift box</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Related products */}
        <div className="mt-20">
          <h2 className="font-serif text-2xl md:text-3xl mb-8 text-center">You May Also Like</h2>
          {category ? (
            <ProductGrid categorySlug={category.slug} limit={4} />
          ) : (
            <ProductGrid limit={4} />
          )}
        </div>
      </div>
    </>
  );
};

export default Product;
