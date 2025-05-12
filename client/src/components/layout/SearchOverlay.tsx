import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import { useUIStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

type Product = {
  id: number;
  name: string;
  price: number;
  images: string[];
};

const SearchOverlay = () => {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when search overlay opens
  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch();
      }
    };
    
    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSearchOpen, closeSearch]);
  
  // Prevent body scroll when search is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);
  
  // Search query
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/products');
      return res.json();
    },
    enabled: isSearchOpen && searchTerm.length > 2
  });
  
  // Filter products based on search term
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };
  
  const handleClose = () => {
    closeSearch();
    setSearchTerm('');
  };
  
  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
        >
          <div className="w-full max-w-xl px-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for products..."
                className="w-full py-4 pl-4 pr-12 rounded-none bg-transparent border-b-2 border-white text-white placeholder-medium-gray focus:outline-none focus:border-pastel-rose"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                type="submit" 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white"
                aria-label="Search"
              >
                <Search className="h-6 w-6" />
              </button>
            </form>
            
            {/* Search results */}
            <div className="mt-8 max-h-96 overflow-y-auto">
              {isLoading && searchTerm.length > 2 ? (
                <div className="flex justify-center">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              ) : searchTerm.length > 2 && filteredProducts?.length === 0 ? (
                <p className="text-white text-center">No products found.</p>
              ) : searchTerm.length > 2 && filteredProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProducts.map(product => (
                    <Link 
                      key={product.id} 
                      href={`/product/${product.id}`} 
                      onClick={handleClose}
                      className="flex items-center bg-white bg-opacity-10 p-2 hover:bg-opacity-20 transition-colors"
                    >
                      <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="w-16 h-16 object-cover mr-3"
                      />
                      <div>
                        <h4 className="text-white font-serif">{product.name}</h4>
                        <p className="text-medium-gray">€{product.price.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
            
            <div className="flex justify-end mt-6">
              <button 
                onClick={handleClose}
                className="text-white hover:text-gray-300 transition-colors"
                aria-label="Close search"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
