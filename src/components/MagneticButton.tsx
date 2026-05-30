import React, { useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({ children, className = '', onClick }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Springs for smooth pull and release
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    
    // Calculate center of the button
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    // Subtle magnetic pull (fraction of distance)
    x.set(middleX * 0.3);
    y.set(middleY * 0.3);
  };

  const handleMouseLeave = () => {
    // Snap back to original position
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer ${className}`}
      style={{ x, y }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
};
