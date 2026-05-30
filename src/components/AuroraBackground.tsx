import { useThemeStore } from '../store/themeStore';

export function AuroraBackground() {
  const activeTheme = useThemeStore((state) => state.activeTheme);

  if (activeTheme === 'meridian-dark') {
    return <div className="fixed inset-0 z-[-1] pointer-events-none transition-colors duration-1000 bg-blend-dark" />;
  }
  
  if (activeTheme === 'light') {
    return <div className="fixed inset-0 z-[-1] pointer-events-none transition-colors duration-1000 bg-blend-light" />;
  }

  if (activeTheme === 'bloomberg') {
    return (
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-black overflow-hidden">
        {/* Terminal Scanlines */}
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, var(--color-accent) 2px, var(--color-accent) 4px)`,
            backgroundSize: '100% 4px',
          }}
        />
        {/* CRT Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
      </div>
    );
  }

  if (activeTheme === 'high-contrast') {
    return (
      <div className="fixed inset-0 z-[-1] pointer-events-none bg-black">
        {/* Stark Geometric Grid */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--color-border-secondary) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-border-secondary) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />
      </div>
    );
  }

  // Custom / Fallback
  return <div className="fixed inset-0 z-[-1] pointer-events-none bg-bg-primary transition-colors duration-500" />;
}
