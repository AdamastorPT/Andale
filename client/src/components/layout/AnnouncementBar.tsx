import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Multiple announcement messages for rotation
const announcements = [
  "Free shipping on orders over €100 | Use code WELCOME15 for 15% off your first order",
  "New Summer Collection now available! Shop limited edition pieces",
  "Exclusive online deals - Sign up for our newsletter for special offers"
];

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Auto-rotate announcements every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  const hideAnnouncement = () => {
    setIsVisible(false);
    // Optionally save to localStorage to remember user preference
    localStorage.setItem('announcementHidden', 'true');
  };
  
  const nextAnnouncement = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
  };
  
  const prevAnnouncement = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + announcements.length) % announcements.length);
  };
  
  // Check if already dismissed
  if (localStorage.getItem('announcementHidden') === 'true') {
    return null;
  }
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-black text-white text-center py-3 text-xs sm:text-sm relative"
        >
          <div className="container mx-auto px-4 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="px-8"
              >
                {announcements[currentIndex]}
              </motion.div>
            </AnimatePresence>
            
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 flex items-center">
              <button 
                onClick={prevAnnouncement}
                className="text-white hover:text-pastel-rose transition-colors p-1"
                aria-label="Previous announcement"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
            </div>
            
            <div className="absolute top-1/2 right-8 transform -translate-y-1/2 flex items-center">
              <button 
                onClick={nextAnnouncement}
                className="text-white hover:text-pastel-rose transition-colors p-1"
                aria-label="Next announcement"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            
            <button 
              onClick={hideAnnouncement}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:text-pastel-rose transition-colors"
              aria-label="Close announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Progress indicators */}
          <div className="flex justify-center gap-1 mt-1">
            {announcements.map((_, index) => (
              <div 
                key={index} 
                className={`h-1 w-6 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-pastel-rose' : 'bg-white bg-opacity-30'}`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBar;
