import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore, useUIStore, useAuthStore } from '@/lib/store';
import { Menu, Search, User, ShoppingBag, ChevronDown, X } from 'lucide-react';

const Navbar = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  
  const { openSearch } = useUIStore();
  const { openCart, totalItems } = useCartStore();
  const { openAuthModal, authModalTab } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();
  
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const toggleDropdown = (dropdown: string) => {
    setDropdownOpen(dropdownOpen === dropdown ? null : dropdown);
  };
  
  return (
    <nav className="bg-white border-b border-light-gray sticky top-0 z-40">
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
          <div className="hidden md:flex items-center space-x-8 flex-grow">
            <Link href="/" className="text-black hover:text-pastel-rose text-sm font-medium uppercase tracking-widest">
              Home
            </Link>
            <div className="relative group">
              <button 
                className="text-black hover:text-pastel-rose text-sm font-medium uppercase tracking-widest flex items-center"
                onClick={() => toggleDropdown('jewelry')}
                aria-expanded={dropdownOpen === 'jewelry'}
              >
                Shop
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <AnimatePresence>
                {dropdownOpen === 'jewelry' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-10"
                  >
                    <Link href="/category/earrings" className="block px-4 py-2 text-sm hover:bg-soft-gray">
                      Earrings
                    </Link>
                    <Link href="/category/necklaces" className="block px-4 py-2 text-sm hover:bg-soft-gray">
                      Necklaces
                    </Link>
                    <Link href="/category/bracelets" className="block px-4 py-2 text-sm hover:bg-soft-gray">
                      Bracelets
                    </Link>
                    <Link href="/category/rings" className="block px-4 py-2 text-sm hover:bg-soft-gray">
                      Rings
                    </Link>
                    <Link href="/category/new-arrivals" className="block px-4 py-2 text-sm hover:bg-soft-gray">
                      New Arrivals
                    </Link>
                    <Link href="/category/best-sellers" className="block px-4 py-2 text-sm hover:bg-soft-gray">
                      Best Sellers
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/about" className="text-black hover:text-pastel-rose text-sm font-medium uppercase tracking-widest">
              About
            </Link>
            <Link href="/contact" className="text-black hover:text-pastel-rose text-sm font-medium uppercase tracking-widest">
              Contact
            </Link>
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-4">
            <button 
              className="text-black hover:text-pastel-rose" 
              onClick={openSearch}
              aria-label="Search"
            >
              <Search className="h-6 w-6" />
            </button>
            <button 
              className="text-black hover:text-pastel-rose relative" 
              onClick={() => isAuthenticated ? (window.location.href = '/profile') : openAuthModal('login')}
              aria-label={isAuthenticated ? "View profile" : "Login"}
            >
              <User className="h-6 w-6" />
              {isAuthenticated && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
              )}
            </button>
            <button 
              className="text-black hover:text-pastel-rose relative" 
              onClick={openCart}
              aria-label="View cart"
            >
              <ShoppingBag className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-pastel-rose text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 pb-4 overflow-hidden"
            >
              <Link href="/" className="block py-2 text-black font-medium">
                Home
              </Link>
              <button 
                className="flex items-center justify-between w-full py-2 text-black font-medium"
                onClick={() => toggleDropdown('shop-mobile')}
              >
                Shop
                <ChevronDown className={`h-4 w-4 transform ${dropdownOpen === 'shop-mobile' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {dropdownOpen === 'shop-mobile' && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pl-4 mt-1 mb-2"
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
              <Link href="/about" className="block py-2 text-black font-medium">
                About
              </Link>
              <Link href="/contact" className="block py-2 text-black font-medium">
                Contact
              </Link>
              {isAuthenticated && (
                <Link href="/profile" className="block py-2 text-black font-medium">
                  My Account
                </Link>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <Link href="/admin" className="block py-2 text-black font-medium">
                  Admin Panel
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
