import React, { useRef, useState, forwardRef } from 'react';

export const SpotlightCard = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, className = '', ...props }, ref) => {
  const localRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  // Merge refs so React Grid Layout can position the element
  const setRefs = (node: HTMLDivElement) => {
    localRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!localRef.current) return;

    const div = localRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    
    // Call original onMouseMove if provided
    if (props.onMouseMove) props.onMouseMove(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setOpacity(1);
    if (props.onMouseEnter) props.onMouseEnter(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    setOpacity(0);
    if (props.onMouseLeave) props.onMouseLeave(e);
  };

  return (
    <div
      {...props}
      ref={setRefs}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl overflow-hidden bg-[#0c0c0e] border border-border-secondary shadow-2xl transition-all duration-300 ease-out ${className}`}
    >
      {/* Dynamic Hover Spotlight Gradient */}
      <div
        className="pointer-events-none absolute -inset-px transition duration-300 z-10"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(251, 146, 60, 0.2), transparent 40%)`,
        }}
      />
      
      {/* Premium Inner Glow */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />

      {/* Physical Depth: Noise Texture */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay z-0" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      <div className="relative h-full w-full z-20">
        {children}
      </div>
    </div>
  );
});

SpotlightCard.displayName = 'SpotlightCard';
