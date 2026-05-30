import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  prefix = '', 
  suffix = '', 
  decimals = 0, 
  className = '' 
}) => {
  // Bouncy spring to smoothly interpolate numbers
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  
  const display = useTransform(spring, (current) => {
    return prefix + current.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    }) + suffix;
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
};
