import { useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

const CartDrawer = () => {
  const { 
    isOpen, 
    closeCart, 
    items, 
    totalPrice, 
    removeItem, 
    updateQuantity 
  } = useCartStore();
  
  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const drawerVariants = {
    hidden: { x: '100%' },
    visible: { x: '0%' },
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeCart}
          />
          
          {/* Cart drawer */}
          <motion.div
            className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg z-50 overflow-auto cart-drawer"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={drawerVariants}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-medium">Your Shopping Bag</h2>
                <button
                  onClick={closeCart}
                  className="text-medium-gray hover:text-black transition-colors"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 mx-auto text-medium-gray mb-4" />
                  <p className="text-medium-gray mb-4">Your shopping bag is empty</p>
                  <Button
                    onClick={closeCart}
                    className="bg-black text-white hover:bg-black/90"
                  >
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-light-gray">
                    {items.map((item) => (
                      <div key={item.id} className="py-4 flex">
                        <img 
                          src={item.product.images[0]} 
                          alt={item.product.name} 
                          className="w-20 h-20 object-cover"
                        />
                        <div className="ml-4 flex-grow">
                          <h3 className="font-serif text-sm mb-1">{item.product.name}</h3>
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <button 
                                className="w-6 h-6 border border-light-gray flex items-center justify-center"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="mx-2 text-sm">{item.quantity}</span>
                              <button 
                                className="w-6 h-6 border border-light-gray flex items-center justify-center"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-medium">€{(item.product.price * item.quantity).toFixed(2)}</span>
                          </div>
                          <button 
                            className="text-xs text-medium-gray hover:text-black mt-2"
                            onClick={() => removeItem(item.id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-light-gray">
                    <div className="flex justify-between mb-2">
                      <span className="text-medium-gray">Subtotal</span>
                      <span className="font-medium">€{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-medium-gray">Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="flex justify-between mb-6 text-lg font-medium">
                      <span>Total</span>
                      <span>€{totalPrice.toFixed(2)}</span>
                    </div>
                    <Link href="/checkout">
                      <Button 
                        className="w-full bg-black text-white py-3 font-medium tracking-wide mb-3 hover:bg-black/90"
                        onClick={closeCart}
                      >
                        CHECKOUT
                      </Button>
                    </Link>
                    <Button 
                      className="w-full border border-black bg-transparent text-black py-3 font-medium tracking-wide hover:bg-soft-gray"
                      onClick={closeCart}
                      variant="outline"
                    >
                      CONTINUE SHOPPING
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
