import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from './queryClient';

// Types for cart item
type CartItem = {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    images: string[];
  };
};

// Types for auth store
type User = {
  id: number;
  email: string;
  name?: string;
  role: string;
  address?: string;
  phone?: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
};

// Types for cart store
type CartState = {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  initializeCart: () => void;
};

// Types for UI store
type UIState = {
  isSearchOpen: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  toggleSearch: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  toggleAuthModal: () => void;
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'register') => void;
};

// Auth store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  isAdmin: false,
  login: (user, token) => {
    localStorage.setItem('authToken', token);
    set({ 
      user, 
      token, 
      isAuthenticated: true,
      isAdmin: user.role === 'admin'
    });
  },
  logout: () => {
    localStorage.removeItem('authToken');
    set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
  }
}));

// Cart store
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      totalItems: 0,
      totalPrice: 0,
      
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      
      addItem: (item) => {
        const { items } = get();
        const existingItem = items.find(i => i.productId === item.productId);
        
        if (existingItem) {
          // Update quantity if item already exists
          return get().updateQuantity(existingItem.id, existingItem.quantity + item.quantity);
        }
        
        set(state => {
          const newItems = [...state.items, item];
          return {
            items: newItems,
            totalItems: calculateTotalItems(newItems),
            totalPrice: calculateTotalPrice(newItems)
          };
        });
        
        // If authenticated, sync with server
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          apiRequest('POST', '/api/cart', {
            productId: item.productId,
            quantity: item.quantity
          }).catch(console.error);
        }
      },
      
      removeItem: (id) => {
        set(state => {
          const newItems = state.items.filter(item => item.id !== id);
          return {
            items: newItems,
            totalItems: calculateTotalItems(newItems),
            totalPrice: calculateTotalPrice(newItems)
          };
        });
        
        // If authenticated, sync with server
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          apiRequest('DELETE', `/api/cart/${id}`).catch(console.error);
        }
      },
      
      updateQuantity: (id, quantity) => {
        set(state => {
          const newItems = state.items.map(item => 
            item.id === id ? { ...item, quantity } : item
          );
          return {
            items: newItems,
            totalItems: calculateTotalItems(newItems),
            totalPrice: calculateTotalPrice(newItems)
          };
        });
        
        // If authenticated, sync with server
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          apiRequest('PATCH', `/api/cart/${id}`, { quantity }).catch(console.error);
        }
      },
      
      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0
        });
        
        // If authenticated, sync with server
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          apiRequest('DELETE', '/api/cart').catch(console.error);
        }
      },
      
      initializeCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        
        if (isAuthenticated) {
          try {
            const response = await apiRequest('GET', '/api/cart');
            const cartItems = await response.json();
            
            set({
              items: cartItems,
              totalItems: calculateTotalItems(cartItems),
              totalPrice: calculateTotalPrice(cartItems)
            });
          } catch (error) {
            console.error('Failed to fetch cart:', error);
          }
        }
      }
    }),
    {
      name: 'cart-storage',
      // Only persist these keys
      partialize: (state) => ({ 
        items: state.items
      }),
    }
  )
);

// UI store
export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  isAuthModalOpen: false,
  authModalTab: 'login',
  
  toggleSearch: () => set(state => ({ isSearchOpen: !state.isSearchOpen })),
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  
  toggleAuthModal: () => set(state => ({ isAuthModalOpen: !state.isAuthModalOpen })),
  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthModalTab: (tab) => set({ authModalTab: tab })
}));

// Helper functions
function calculateTotalItems(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
}
