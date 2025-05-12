import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, useUIStore, useAuthStore } from '@/lib/store';
import { Menu, Search, User, ShoppingBag, ChevronDown, X, Heart, Phone, Globe } from 'lucide-react';

const Navbar = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const { openSearch } = useUIStore();
  const { openCart, totalItems } = useCartStore();
  const { openAuthModal } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();
  
  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 80) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen && !(event.target as Element).closest('.dropdown-trigger')) {
        setDropdownOpen(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleDropdown = (dropdown: string) => {
    setDropdownOpen(dropdownOpen === dropdown ? null : dropdown);
  };
  
  // Variants for animations
  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };
  
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, height: 0 },
    visible: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -5, height: 0, transition: { duration: 0.2 } }
  };
  
  return (
    <>
      {/* Top navigation bar with contact and language */}
      <div className="hidden md:block bg-soft-gray border-b border-light-gray py-2 text-xs">
        <div className="container mx-auto px-4 flex justify-between">
          <div className="flex items-center space-x-4">
            <a href="tel:+351123456789" className="flex items-center text-medium-gray hover:text-black transition-colors">
              <Phone className="h-3 w-3 mr-1" />
              +351 123 456 789
            </a>
            <a href="mailto:info@drbijuteria.com" className="text-medium-gray hover:text-black transition-colors">
              info@drbijuteria.com
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-medium-gray hover:text-black transition-colors">
              <Globe className="h-3 w-3 mr-1" />
              EN
            </button>
            {isAuthenticated && user?.role === 'admin' && (
              <Link href="/admin" className="text-medium-gray hover:text-black transition-colors">
                Admin Panel
              </Link>
            )}
            <Link href="/wishlist" className="text-medium-gray hover:text-black transition-colors flex items-center">
              <Heart className="h-3 w-3 mr-1" />
              Wishlist
            </Link>
            <button 
              onClick={() => isAuthenticated ? (window.location.href = '/profile') : openAuthModal('login')}
              className="text-medium-gray hover:text-black transition-colors"
            >
              {isAuthenticated ? 'My Account' : 'Sign In / Register'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main navigation */}
      <motion.nav 
        className={`bg-white sticky top-0 z-40 ${scrolled ? 'shadow-md' : 'border-b border-light-gray'}`}
        initial="hidden"
        animate="visible"
        variants={navVariants}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-black" 
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="font-serif text-2xl md:text-3xl font-bold tracking-wider text-center flex-grow md:flex-grow-0 md:mr-10">
              DRBijuteria
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10 flex-grow justify-center">
              <Link href="/" className="text-black hover:text-pastel-rose text-sm font-medium uppercase tracking-widest py-2 relative group">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pastel-rose transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <div className="relative dropdown-trigger">
                <button 
                  className="text-black hover:text-pastel-rose text-sm font-medium uppercase tracking-widest flex items-center py-2 relative group"
                  onClick={() => toggleDropdown('jewelry')}
                  aria-expanded={dropdownOpen === 'jewelry'}
                >
                  Shop
                  <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-300 ${dropdownOpen === 'jewelry' ? 'rotate-180' : ''}`} />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pastel-rose transition-all duration-300 group-hover:w-full"></span>
                </button>
                <AnimatePresence>
                  {dropdownOpen === 'jewelry' && (
                    <motion.div 
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      className="absolute left-0 top-full mt-1 w-56 bg-white shadow-xl rounded-sm py-3 z-10"
                    >
                      <div className="grid grid-cols-1 gap-1">
                        <Link href="/category/earrings" className="px-5 py-2 text-sm hover:bg-soft-gray hover:text-pastel-rose transition-colors">
                          Earrings
                        </Link>
                        <Link href="/category/necklaces" className="px-5 py-2 text-sm hover:bg-soft-gray hover:text-pastel-rose transition-colors">
                          Necklaces
                        </Link>
                        <Link href="/category/bracelets" className="px-5 py-2 text-sm hover:bg-soft-gray hover:text-pastel-rose transition-colors">
                          Bracelets
                        </Link>
                        <Link href="/category/rings" className="px-5 py-2 text-sm hover:bg-soft-gray hover:text-pastel-rose transition-colors">
                          Rings
                        </Link>
                        <div className="my-1 border-t border-light-gray"></div>
                        <Link href="/category/new-arrivals" className="px-5 py-2 text-sm hover:bg-soft-gray hover:text-pastel-rose transition-colors">
                          New Arrivals
                        </Link>
                        <Link href="/category/best-sellers" className="px-5 py-2 text-sm hover:bg-soft-gray hover:text-pastel-rose transition-colors">
                          Best Sellers
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link href="/about" className="text-black hover:text-pastel-rose text-sm font-medium uppercase tracking-widest py-2 relative group">
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pastel-rose transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/contact" className="text-black hover:text-pastel-rose text-sm font-medium uppercase tracking-widest py-2 relative group">
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pastel-rose transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>

            {/* Right icons */}
            <div className="flex items-center space-x-6">
              <button 
                className="text-black hover:text-pastel-rose transition-colors" 
                onClick={openSearch}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <div className="hidden md:block">
                <button 
                  className="text-black hover:text-pastel-rose transition-colors relative" 
                  onClick={() => isAuthenticated ? (window.location.href = '/profile') : openAuthModal('login')}
                  aria-label={isAuthenticated ? "View profile" : "Login"}
                >
                  <User className="h-5 w-5" />
                  {isAuthenticated && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </button>
              </div>
              <button 
                className="text-black hover:text-pastel-rose transition-colors relative" 
                onClick={openCart}
                aria-label="View cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                ref={mobileMenuRef}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden mt-4 pb-4 overflow-hidden divide-y divide-light-gray"
              >
                <Link href="/" className="block py-3 text-black font-medium">
                  Home
                </Link>
                <div>
                  <button 
                    className="flex items-center justify-between w-full py-3 text-black font-medium"
                    onClick={() => toggleDropdown('shop-mobile')}
                  >
                    Shop
                    <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${dropdownOpen === 'shop-mobile' ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {dropdownOpen === 'shop-mobile' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-4 mt-1 mb-2 space-y-2"
                      >
                        <Link href="/category/earrings" className="block py-2 text-black">
                          Earrings
                        </Link>
                        <Link href="/category/necklaces" className="block py-2 text-black">
                          Necklaces
                        </Link>
                        <Link href="/category/bracelets" className="block py-2 text-black">
                          Bracelets
                        </Link>
                        <Link href="/category/rings" className="block py-2 text-black">
                          Rings
                        </Link>
                        <Link href="/category/new-arrivals" className="block py-2 text-black">
                          New Arrivals
                        </Link>
                        <Link href="/category/best-sellers" className="block py-2 text-black">
                          Best Sellers
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <Link href="/about" className="block py-3 text-black font-medium">
                  About
                </Link>
                <Link href="/contact" className="block py-3 text-black font-medium">
                  Contact
                </Link>
                <Link href="/wishlist" className="block py-3 text-black font-medium">
                  Wishlist
                </Link>
                {isAuthenticated ? (
                  <Link href="/profile" className="block py-3 text-black font-medium">
                    My Account
                  </Link>
                ) : (
                  <button 
                    onClick={() => openAuthModal('login')}
                    className="block w-full text-left py-3 text-black font-medium"
                  >
                    Sign In / Register
                  </button>
                )}
                {isAuthenticated && user?.role === 'admin' && (
                  <Link href="/admin" className="block py-3 text-black font-medium">
                    Admin Panel
                  </Link>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;
