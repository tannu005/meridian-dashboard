import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const WelcomeOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('meridian_onboarding_seen');
    if (!hasSeen) {
      // Small delay for dramatic effect
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('meridian_onboarding_seen', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleDismiss}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-bg-secondary border border-accent/30 shadow-2xl rounded-2xl overflow-hidden p-6 md:p-8"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-accent/20 text-accent rounded-full mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <h2 className="text-2xl font-sans font-bold text-text-primary mb-2">
              Welcome to Meridian Analytics
            </h2>
            <p className="text-sm text-text-secondary font-sans leading-relaxed mb-6">
              We've redesigned the dashboard to be more intuitive and accessible. 
              By default, you are starting in <span className="font-bold text-accent">Simple Mode</span>, which hides complex institutional metrics.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Progressive Disclosure</h4>
                  <p className="text-xs text-text-muted mt-1">Hover over the (?) icons for simple explanations of each widget's purpose.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-status-success shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-text-primary">Custom Layouts</h4>
                  <p className="text-xs text-text-muted mt-1">Toggle Simple Mode off in the top toolbar to access advanced layouts and data grids.</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-glow"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
