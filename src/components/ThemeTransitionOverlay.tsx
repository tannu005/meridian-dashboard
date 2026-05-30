import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

export function ThemeTransitionOverlay() {
  const pendingTheme = useThemeStore((state) => state.pendingTheme);
  const commitTheme = useThemeStore((state) => state.commitTheme);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (pendingTheme) {
      setIsVisible(true);
      // Wait for the shutter to cover the screen
      const timer1 = setTimeout(() => {
        commitTheme();
        // Wait a tiny bit more to ensure React renders the new colors behind the shutter
        const timer2 = setTimeout(() => {
          setIsVisible(false);
        }, 100);
        return () => clearTimeout(timer2);
      }, 400); // Shutter slide duration
      
      return () => clearTimeout(timer1);
    }
  }, [pendingTheme, commitTheme]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: '-100%', opacity: 0.5 }}
          animate={{ x: '0%', opacity: 1 }}
          exit={{ x: '100%', opacity: 0.5 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.5 }}
          className="fixed inset-0 z-[999999] bg-bg-secondary/95 backdrop-blur-3xl flex items-center justify-center border-r-4 border-accent shadow-[20px_0_50px_rgba(0,0,0,0.5)] pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center font-bold text-bg-primary text-3xl shadow-glow">
              M
            </div>
            <span className="font-mono text-sm tracking-widest text-text-primary uppercase font-bold">
              Configuring Workspace
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
