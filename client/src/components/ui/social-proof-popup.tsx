import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';
import { ShoppingBag, MapPin } from 'lucide-react';
import { Link } from 'wouter';

type SocialProofData = {
  productId: number;
  productName: string;
  productImage: string;
  location: string;
  timestamp: string;
};

// Sample data - in a real app, this would come from the API
const SAMPLE_PROOFS: SocialProofData[] = [
  {
    productId: 1,
    productName: 'Pearl Drop Earrings',
    productImage: 'https://pixabay.com/get/g601398d5d6c2510bdbcbfd6b465bb56ce8a515cb44fc67f299da54daf9cc747ef56b01812eb6096693e7fc7cb82596401d5f941d6ac2b3971e0a212a7d5186e5_1280.jpg',
    location: 'Lisbon, Portugal',
    timestamp: '2 minutes ago'
  },
  {
    productId: 2,
    productName: 'Gold Chain Necklace',
    productImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=800',
    location: 'Porto, Portugal',
    timestamp: '5 minutes ago'
  },
  {
    productId: 3,
    productName: 'Silver Charm Bracelet',
    productImage: 'https://pixabay.com/get/g544d7e4da7fde568c349efba14ddb978fca55e2432d480f4cf35857340fcb1ee52ad55748d3e5df585a0e78cfafce95ddbb777acab1a78f003d39db38ea93035_1280.jpg',
    location: 'Madrid, Spain',
    timestamp: '12 minutes ago'
  },
  {
    productId: 4,
    productName: 'Diamond Engagement Ring',
    productImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=800',
    location: 'Paris, France',
    timestamp: '20 minutes ago'
  }
];

// Cities to randomize
const CITIES = [
  'Lisbon, Portugal', 'Porto, Portugal', 'Madrid, Spain', 'Barcelona, Spain',
  'Paris, France', 'London, UK', 'Berlin, Germany', 'Rome, Italy',
  'Amsterdam, Netherlands', 'Brussels, Belgium', 'Vienna, Austria'
];

// Time periods to randomize
const TIME_PERIODS = [
  'just now', '1 minute ago', '2 minutes ago', '5 minutes ago',
  '10 minutes ago', '15 minutes ago', '30 minutes ago', '1 hour ago'
];

const SocialProofPopup = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [currentProof, setCurrentProof] = useState<SocialProofData | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  // Fetch products for real product data
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiRequest('GET', '/api/products');
        const productsData = await res.json();
        if (productsData && productsData.length > 0) {
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching products for social proof:', error);
      }
    };
    
    fetchProducts();
  }, []);

  // Show popups at random intervals
  useEffect(() => {
    let timeoutId: number;
    
    const showRandomProof = () => {
      if (products.length === 0) {
        // Use sample data if no products are available
        const randomIndex = Math.floor(Math.random() * SAMPLE_PROOFS.length);
        setCurrentProof(SAMPLE_PROOFS[randomIndex]);
      } else {
        // Use real product data
        const randomProductIndex = Math.floor(Math.random() * products.length);
        const product = products[randomProductIndex];
        
        // Randomize location and time
        const randomCityIndex = Math.floor(Math.random() * CITIES.length);
        const randomTimeIndex = Math.floor(Math.random() * TIME_PERIODS.length);
        
        setCurrentProof({
          productId: product.id,
          productName: product.name,
          productImage: product.images && product.images.length > 0 
            ? product.images[0] 
            : 'https://placehold.co/100x100?text=No+Image',
          location: CITIES[randomCityIndex],
          timestamp: TIME_PERIODS[randomTimeIndex]
        });
      }
      
      setIsVisible(true);
      
      // Hide the popup after 4 seconds
      setTimeout(() => {
        setIsVisible(false);
        
        // Schedule next popup to appear between 15-45 seconds
        const nextTimeout = Math.floor(Math.random() * 30000) + 15000;
        timeoutId = window.setTimeout(showRandomProof, nextTimeout);
      }, 4000);
    };
    
    // Show first popup after 5 seconds
    timeoutId = window.setTimeout(showRandomProof, 5000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [products]);
  
  return (
    <AnimatePresence>
      {isVisible && currentProof && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50, x: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 25 
          }}
          className="fixed bottom-4 left-4 z-40 max-w-xs bg-white shadow-lg rounded-md overflow-hidden"
        >
          <Link href={`/product/${currentProof.productId}`}>
            <div className="flex p-3">
              <div className="w-16 h-16 mr-3">
                <img 
                  src={currentProof.productImage} 
                  alt={currentProof.productName}
                  className="w-full h-full object-cover rounded-sm"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center text-xs text-medium-gray mb-1">
                  <div className="flex items-center mr-2">
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    <span>Purchased</span>
                  </div>
                  <span>·</span>
                  <span className="ml-2">{currentProof.timestamp}</span>
                </div>
                <div className="text-sm font-medium mb-1 line-clamp-1">
                  {currentProof.productName}
                </div>
                <div className="flex items-center text-xs text-medium-gray">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{currentProof.location}</span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofPopup;