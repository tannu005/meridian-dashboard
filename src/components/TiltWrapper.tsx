import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const TiltWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the mouse movements
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  // Map mouse position to rotation angle
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate relative mouse position (-0.5 to 0.5)
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    // Reset on leave
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="w-full h-full relative"
    >
      <div 
        style={{ transform: "translateZ(20px)" }} 
        className="w-full h-full rounded-3xl overflow-hidden"
      >
        {children}
      </div>
    </motion.div>
  );
};
