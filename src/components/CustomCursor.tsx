import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

export function CustomCursor() {
  const activeTheme = useThemeStore((state) => state.activeTheme);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Spring config for smooth trailing effects
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const target = e.target as HTMLElement;
      if (target) {
        const computedStyle = window.getComputedStyle(target);
        setIsHovering(
          computedStyle.cursor === 'pointer' ||
          target.tagName.toLowerCase() === 'button' ||
          target.tagName.toLowerCase() === 'a' ||
          target.tagName.toLowerCase() === 'select' ||
          !!target.closest('button') ||
          !!target.closest('a')
        );
      }
    };
    
    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  // Hidden on touch devices
  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[99999] overflow-hidden">
      
      {/* THEME: Meridian Dark (Premium Magnetic Ring) */}
      {activeTheme === 'meridian-dark' && (
        <div className="mix-blend-difference">
          <motion.div
            className="absolute top-0 left-0 w-2 h-2 rounded-full bg-white pointer-events-none"
            style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
            animate={{ scale: isHovering ? 0 : 1, opacity: isHovering ? 0 : 1 }}
            transition={{ duration: 0.15 }}
          />
          <motion.div
            className="absolute top-0 left-0 rounded-full flex items-center justify-center pointer-events-none"
            style={{ x: smoothX, y: smoothY, translateX: "-50%", translateY: "-50%" }}
            animate={{
              width: isHovering ? 48 : 36,
              height: isHovering ? 48 : 36,
              backgroundColor: isHovering ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
              border: isHovering ? "0px solid rgba(255,255,255,0)" : "1.5px solid rgba(255,255,255,0.6)",
              scale: isHovering ? 1.2 : 1
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          />
        </div>
      )}

      {/* THEME: Classic Light (Liquid Glowing Orb) */}
      {activeTheme === 'light' && (
        <div className="mix-blend-multiply">
          <motion.div
            className="absolute top-0 left-0 rounded-full pointer-events-none bg-accent blur-md"
            style={{ x: smoothX, y: smoothY, translateX: "-50%", translateY: "-50%" }}
            animate={{
              width: isHovering ? 70 : 30,
              height: isHovering ? 70 : 30,
              opacity: isHovering ? 0.2 : 0.5
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          />
        </div>
      )}

      {/* THEME: Bloomberg Wire (Terminal Crosshair) */}
      {activeTheme === 'bloomberg' && (
        <>
          <motion.div
            className="absolute top-0 bottom-0 w-[1px] bg-accent/40 pointer-events-none"
            style={{ x: cursorX }}
            transition={{ duration: 0 }}
          />
          <motion.div
            className="absolute left-0 right-0 h-[1px] bg-accent/40 pointer-events-none"
            style={{ y: cursorY }}
            transition={{ duration: 0 }}
          />
        </>
      )}

      {/* THEME: High Contrast (Brutalist Neon Block) */}
      {activeTheme === 'high-contrast' && (
        <motion.div
          className="absolute top-0 left-0 w-4 h-4 bg-accent border-[3px] border-text-primary pointer-events-none shadow-[4px_4px_0px_var(--color-text-primary)]"
          style={{ x: cursorX, y: cursorY }}
          animate={{
            scale: isHovering ? 1.5 : 1,
            rotate: isHovering ? 45 : 0,
            borderRadius: isHovering ? "50%" : "0%"
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
        />
      )}

      {/* THEME: Brand Builder (Sleek Minimal Dot) */}
      {activeTheme === 'custom' && (
        <motion.div
          className="absolute top-0 left-0 w-3 h-3 rounded-full bg-accent pointer-events-none shadow-glow"
          style={{ x: smoothX, y: smoothY, translateX: "-50%", translateY: "-50%" }}
          animate={{ scale: isHovering ? 2 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        />
      )}

    </div>
  );
}
