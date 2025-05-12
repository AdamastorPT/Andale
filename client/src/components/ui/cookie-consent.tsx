import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';
import { X } from 'lucide-react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Cookie preferences
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    functional: false,
    analytics: false,
    marketing: false
  });
  
  useEffect(() => {
    // Check if consent was previously given
    const hasConsent = localStorage.getItem('cookieConsent');
    
    if (!hasConsent) {
      // Show cookie banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const acceptAll = () => {
    const allPreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    
    setPreferences(allPreferences);
    saveConsent(allPreferences);
    setIsVisible(false);
  };
  
  const acceptSelected = () => {
    saveConsent(preferences);
    setIsVisible(false);
    setShowSettings(false);
  };
  
  const saveConsent = (prefs: typeof preferences) => {
    localStorage.setItem('cookieConsent', 'true');
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
    
    // Here you would typically set actual cookies based on preferences
    // or initialize tracking tools based on consent
  };
  
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 z-50 border-t border-light-gray"
    >
      <div className="container mx-auto">
        <AnimatePresence mode="wait">
          {!showSettings ? (
            <motion.div 
              key="basic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap items-center justify-between"
            >
              <p className="text-sm text-medium-gray mb-4 md:mb-0 md:mr-4 max-w-3xl">
                We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                <a href="/privacy" className="underline ml-1">Learn more</a>
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={toggleSettings}
                  className="text-black border border-light-gray px-4 py-2 text-sm font-medium hover:bg-soft-gray"
                >
                  Cookie Settings
                </Button>
                <Button
                  onClick={acceptAll}
                  className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-opacity-90"
                >
                  Accept All
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <button 
                onClick={toggleSettings}
                className="absolute top-0 right-0 text-medium-gray hover:text-black"
                aria-label="Back to cookie consent"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h3 className="font-serif text-lg mb-4">Cookie Preferences</h3>
              <p className="text-sm text-medium-gray mb-4">
                Customize your cookie preferences below. Essential cookies are always active as they are necessary for the website to function properly.
              </p>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    id="necessary" 
                    checked={preferences.necessary} 
                    disabled
                    className="mt-1 mr-3"
                  />
                  <div>
                    <label htmlFor="necessary" className="font-medium">Essential Cookies</label>
                    <p className="text-sm text-medium-gray">These cookies are necessary for the website to function and cannot be disabled.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    id="functional" 
                    checked={preferences.functional} 
                    onChange={e => setPreferences({...preferences, functional: e.target.checked})}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <label htmlFor="functional" className="font-medium">Functional Cookies</label>
                    <p className="text-sm text-medium-gray">These cookies enable personalized features and functionality.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    id="analytics" 
                    checked={preferences.analytics} 
                    onChange={e => setPreferences({...preferences, analytics: e.target.checked})}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <label htmlFor="analytics" className="font-medium">Analytics Cookies</label>
                    <p className="text-sm text-medium-gray">These cookies help us improve our website by collecting analytics information.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <input 
                    type="checkbox" 
                    id="marketing" 
                    checked={preferences.marketing} 
                    onChange={e => setPreferences({...preferences, marketing: e.target.checked})}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <label htmlFor="marketing" className="font-medium">Marketing Cookies</label>
                    <p className="text-sm text-medium-gray">These cookies are used to track effectiveness of marketing campaigns and show you relevant advertisements.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsVisible(false)}
                  className="text-black border border-light-gray px-4 py-2 text-sm font-medium hover:bg-soft-gray"
                >
                  Reject All
                </Button>
                <Button
                  onClick={acceptSelected}
                  className="bg-black text-white px-4 py-2 text-sm font-medium hover:bg-opacity-90"
                >
                  Save Preferences
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CookieConsent;
