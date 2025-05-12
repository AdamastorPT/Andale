import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  const hideAnnouncement = () => {
    setIsVisible(false);
    // Optionally save to localStorage to remember user preference
    localStorage.setItem('announcementHidden', 'true');
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
          className="bg-pastel-rose text-black text-center py-2 text-xs sm:text-sm relative"
        >
          Free shipping on orders over €100 | Use code WELCOME15 for 15% off your first order
          <button 
            onClick={hideAnnouncement}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-black hover:text-gray-700"
            aria-label="Close announcement"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementBar;
