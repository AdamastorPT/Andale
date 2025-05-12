import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, Loader2, ArrowRight, Bookmark, ShoppingBag, TrendingUp } from 'lucide-react';
import { useUIStore, useCartStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

type Product = {
  id: number;
  name: string;
  price: number;
  images: string[];
  description?: string;
  categoryId?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
};

// Popular search terms for quick access
const popularSearches = [
  'earrings', 'necklace', 'gold', 'silver', 'bracelet', 'ring', 'pendant'
];

// Recent searches (would normally be stored in localStorage or user profile)
const getRecentSearches = (): string[] => {
  try {
    const stored = localStorage.getItem('recentSearches');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading recent searches', e);
    return [];
  }
};

const saveRecentSearch = (term: string) => {
  try {
    let recent = getRecentSearches();
    // Remove duplicates and add new search term to the beginning
    recent = [term, ...recent.filter(t => t !== term)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(recent));
  } catch (e) {
    console.error('Error saving recent search', e);
  }
};

const SearchOverlay = () => {
  const { isSearchOpen, closeSearch } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'trending' | 'new'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { addItem } = useCartStore();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Update recent searches when component mounts
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);
  
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
    enabled: isSearchOpen
  });

  // Function to handle adding to cart with animation
  const handleAddToCart = useCallback((product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: Date.now(),
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
      title: 'Added to Cart',
      description: `${product.name} has been added to your cart.`,
    });
  }, [addItem, toast]);
  
  // Filter products based on search term and active tab
  const getFilteredProducts = useCallback(() => {
    if (!products) return [];
    
    let filtered = products;
    
    // Apply text search filter if there is a search term
    if (searchTerm.length > 0) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply tab filters
    switch (activeTab) {
      case 'trending':
        filtered = filtered.filter(product => product.isBestSeller);
        break;
      case 'new':
        filtered = filtered.filter(product => product.isNew);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }
    
    return filtered;
  }, [products, searchTerm, activeTab]);
  
  const filteredProducts = getFilteredProducts();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      // Save to recent searches
      saveRecentSearch(searchTerm.trim());
      setRecentSearches(getRecentSearches());
      
      // Navigate to search results page with query
      navigate(`/category/all?search=${encodeURIComponent(searchTerm.trim())}`);
      closeSearch();
    }
  };
  
  const handleClose = () => {
    closeSearch();
    setTimeout(() => setSearchTerm(''), 300); // Clear after close animation
  };
  
  const handleQuickSearch = (term: string) => {
    setSearchTerm(term);
    
    // Focus on input after setting the term
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Scroll to results if they exist
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Animated variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };
  
  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          className="fixed inset-0 bg-black bg-opacity-95 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto"
        >
          <div className="w-full max-w-4xl px-4 py-16 md:py-24">
            <motion.div variants={itemVariants} className="relative">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center border-b-2 border-white py-1 focus-within:border-pastel-rose transition-colors">
                  <Search className="h-6 w-6 text-white mr-3" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for jewelry, collections, or specific items..."
                    className="w-full py-4 bg-transparent text-white placeholder-medium-gray focus:outline-none text-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={handleClose} 
                    className="text-white hover:text-pastel-rose transition-colors p-2"
                    aria-label="Close search"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </form>

              {/* Quick search terms */}
              {!searchTerm && (
                <motion.div 
                  variants={itemVariants}
                  className="mt-8"
                >
                  <div className="flex flex-col space-y-6">
                    {/* Recent searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <h3 className="text-white text-lg font-medium mb-4 font-serif">Recent Searches</h3>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((term, index) => (
                            <button
                              key={`recent-${index}`}
                              onClick={() => handleQuickSearch(term)}
                              className="bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2 rounded-full text-white text-sm transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Popular searches */}
                    <div>
                      <h3 className="text-white text-lg font-medium mb-4 font-serif">Popular Searches</h3>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((term, index) => (
                          <button
                            key={`popular-${index}`}
                            onClick={() => handleQuickSearch(term)}
                            className="bg-white bg-opacity-10 hover:bg-opacity-20 px-4 py-2 rounded-full text-white text-sm transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Results tabs - only show when we have results or are loading */}
              {(isLoading || filteredProducts.length > 0 || searchTerm.length > 0) && (
                <motion.div 
                  variants={itemVariants}
                  className="mt-10 mb-6 border-b border-white border-opacity-20"
                >
                  <div className="flex space-x-8">
                    <button 
                      className={`pb-3 relative ${activeTab === 'all' ? 'text-white' : 'text-medium-gray hover:text-white'} transition-colors`}
                      onClick={() => setActiveTab('all')}
                    >
                      All Results
                      {activeTab === 'all' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pastel-rose"></span>}
                    </button>
                    <button 
                      className={`pb-3 relative flex items-center ${activeTab === 'trending' ? 'text-white' : 'text-medium-gray hover:text-white'} transition-colors`}
                      onClick={() => setActiveTab('trending')}
                    >
                      <TrendingUp className="h-4 w-4 mr-1" /> Trending
                      {activeTab === 'trending' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pastel-rose"></span>}
                    </button>
                    <button 
                      className={`pb-3 relative ${activeTab === 'new' ? 'text-white' : 'text-medium-gray hover:text-white'} transition-colors`}
                      onClick={() => setActiveTab('new')}
                    >
                      New Arrivals
                      {activeTab === 'new' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pastel-rose"></span>}
                    </button>
                  </div>
                </motion.div>
              )}
              
              {/* Search results */}
              <motion.div 
                variants={itemVariants}
                className="mt-6"
                ref={resultsRef}
              >
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 text-pastel-rose animate-spin" />
                  </div>
                ) : filteredProducts.length === 0 && searchTerm.length > 0 ? (
                  <div className="text-center py-16">
                    <p className="text-white text-xl font-serif mb-2">No products found</p>
                    <p className="text-medium-gray">Try different keywords or browse our categories</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredProducts.slice(0, 6).map(product => (
                      <Link 
                        key={product.id} 
                        href={`/product/${product.id}`} 
                        onClick={handleClose}
                        className="group"
                      >
                        <div className="bg-white bg-opacity-5 hover:bg-opacity-10 overflow-hidden transition-all rounded-sm relative">
                          {/* Product image */}
                          <div className="relative aspect-[4/5] overflow-hidden">
                            <img 
                              src={product.images?.[0] || 'https://placehold.co/600x800?text=No+Image'} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            
                            {/* Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {product.isNew && (
                                <span className="bg-white text-black text-xs uppercase px-2 py-0.5 font-medium">New</span>
                              )}
                              {product.isBestSeller && (
                                <span className="bg-pastel-rose text-black text-xs uppercase px-2 py-0.5 font-medium">Popular</span>
                              )}
                            </div>
                            
                            {/* Quick action buttons */}
                            <div className="absolute bottom-2 right-2 flex gap-2">
                              <button
                                onClick={(e) => handleAddToCart(product, e)}
                                className="bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 hover:bg-pastel-rose hover:text-black"
                                aria-label="Add to cart"
                              >
                                <ShoppingBag className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toast({
                                    title: 'Added to wishlist',
                                    description: `${product.name} has been added to your wishlist.`,
                                  });
                                }}
                                className="bg-white text-black p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 hover:bg-pastel-rose"
                                aria-label="Add to wishlist"
                              >
                                <Bookmark className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Product info */}
                          <div className="p-4">
                            <h4 className="text-white font-serif font-medium text-lg mb-1 group-hover:text-pastel-rose transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-medium-gray text-sm mb-2">
                              {product.description 
                                ? product.description.substring(0, 60) + (product.description.length > 60 ? '...' : '')
                                : 'Handcrafted Portuguese jewelry'}
                            </p>
                            <p className="text-white font-medium">€{Number(product.price).toFixed(2)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}

                {/* View all results button - show when we have many results */}
                {filteredProducts.length > 6 && searchTerm && (
                  <motion.div 
                    variants={itemVariants}
                    className="mt-8 text-center"
                  >
                    <Link
                      href={`/category/all?search=${encodeURIComponent(searchTerm)}`}
                      onClick={handleClose}
                      className="inline-flex items-center text-white hover:text-pastel-rose transition-colors"
                    >
                      View all {filteredProducts.length} results <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </motion.div>
                )}
              </motion.div>
              
              {/* Links to categories */}
              <motion.div
                variants={itemVariants}
                className="mt-12 pt-8 border-t border-white border-opacity-20"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <h4 className="text-white font-serif font-medium mb-4">Collections</h4>
                    <ul className="space-y-2">
                      <li>
                        <Link 
                          href="/category/new-arrivals" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors flex items-center"
                        >
                          New Arrivals <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100" />
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/category/best-sellers" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors"
                        >
                          Best Sellers
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/category/all" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors"
                        >
                          All Jewelry
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-serif font-medium mb-4">Categories</h4>
                    <ul className="space-y-2">
                      <li>
                        <Link 
                          href="/category/earrings" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors"
                        >
                          Earrings
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/category/necklaces" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors"
                        >
                          Necklaces
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/category/bracelets" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors"
                        >
                          Bracelets
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/category/rings" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors"
                        >
                          Rings
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-serif font-medium mb-4">Customer Service</h4>
                    <ul className="space-y-2">
                      <li>
                        <Link 
                          href="/contact" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors"
                        >
                          Contact Us
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/faq" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors"
                        >
                          FAQs
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/shipping" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors"
                        >
                          Shipping & Returns
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-serif font-medium mb-4">About</h4>
                    <ul className="space-y-2">
                      <li>
                        <Link 
                          href="/about" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors"
                        >
                          Our Story
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/sustainability" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors"
                        >
                          Sustainability
                        </Link>
                      </li>
                      <li>
                        <Link 
                          href="/stores" 
                          onClick={handleClose}
                          className="text-medium-gray hover:text-white transition-colors"
                        >
                          Stores
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
