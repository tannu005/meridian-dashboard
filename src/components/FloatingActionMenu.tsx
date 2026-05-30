import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboardStore } from '../store/dashboardStore';
import { useThemeStore } from '../store/themeStore';
import { WIDGET_REGISTRY } from '../registry/widgetRegistry';
import confetti from 'canvas-confetti';
import { MagneticButton } from './MagneticButton';
import { Sun, Moon } from 'lucide-react';

export function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const addWidget = useDashboardStore((state) => state.addWidget);
  const clearDashboard = useDashboardStore((state) => state.clearDashboard);
  const activeTheme = useThemeStore((state) => state.activeTheme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSurprise = () => {
    // Add 3 random widgets
    const widgetIds = Object.keys(WIDGET_REGISTRY);
    for (let i = 0; i < 3; i++) {
      const randomId = widgetIds[Math.floor(Math.random() * widgetIds.length)];
      addWidget(randomId, { w: 4, h: 4 });
    }
    setIsOpen(false);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#db2777', '#f472b6', '#be185d']
    });
  };

  const handleClear = () => {
    clearDashboard();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="absolute bottom-16 right-0 mb-4 flex flex-col items-end gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(activeTheme === 'light' ? 'meridian-dark' : 'light')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-xl shadow-pink-500/20 border border-pink-100 text-pink-700 font-bold tracking-wide pointer-events-auto"
            >
              <span className="text-sm">{activeTheme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              <span className="text-xl">{activeTheme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSurprise}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-xl shadow-pink-500/20 border border-pink-100 text-pink-700 font-bold tracking-wide pointer-events-auto"
            >
              <span className="text-sm">Surprise Me</span>
              <span className="text-xl">🎲</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-xl shadow-pink-500/20 border border-pink-100 text-pink-700 font-bold tracking-wide pointer-events-auto"
            >
              <span className="text-sm">Clear Grid</span>
              <span className="text-xl">🧹</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <MagneticButton onClick={toggleMenu} className="z-50 relative pointer-events-auto">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-14 h-14 bg-gradient-to-tr from-pink-600 to-pink-400 rounded-full shadow-2xl shadow-pink-500/50 flex items-center justify-center text-white text-2xl border-2 border-white/20"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ type: "spring", bounce: 0.6 }}
          >
            {isOpen ? '✕' : '✨'}
          </motion.div>
        </motion.div>
      </MagneticButton>
    </div>
  );
}
