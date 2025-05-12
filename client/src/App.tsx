import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { useCartStore } from "./lib/store";
import { useEffect } from "react";

// Pages
import Home from "@/pages/home";
import Product from "@/pages/product";
import Category from "@/pages/category";
import Checkout from "@/pages/checkout";
import Profile from "@/pages/profile";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

// Layout components
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import CookieConsent from "@/components/ui/cookie-consent";
import CartDrawer from "@/components/cart/CartDrawer";
import SearchOverlay from "@/components/layout/SearchOverlay";
import AuthModal from "@/components/auth/AuthModal";

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/product/:id" component={Product} />
        <Route path="/category/:slug" component={Category} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/profile" component={Profile} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  const { initializeCart } = useCartStore();

  // Initialize cart from localStorage on app load
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen">
          <AnnouncementBar />
          <Navbar />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
        <CartDrawer />
        <SearchOverlay />
        <AuthModal />
        <CookieConsent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
