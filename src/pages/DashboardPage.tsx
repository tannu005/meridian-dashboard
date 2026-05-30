import { useEffect, useState } from 'react';
import { DashboardHeader } from '../components/dashboardHeader';
import { WidgetCatalog } from '../components/widgetCatalog';
import { GridCanvas } from '../grid/gridCanvas';
import { useThemeStore as useStoreTheme } from '../store/themeStore';
import { useDashboardStore } from '../store/dashboardStore';
import { Finance101Banner } from '../components/Finance101Banner';
import { MarketOverviewBanner } from '../components/MarketOverviewBanner';
import { CustomCursor } from '../components/CustomCursor';
import { WelcomeOverlay } from '../components/WelcomeOverlay';
import { FinancialGlossary } from '../components/FinancialGlossary';

import { AuroraBackground } from '../components/AuroraBackground';
import { FloatingActionMenu } from '../components/FloatingActionMenu';

import { ThemeTransitionOverlay } from '../components/ThemeTransitionOverlay';

export function DashboardPage() {
  const activeTheme = useStoreTheme((state) => state.activeTheme);
  const updateCustomColors = useStoreTheme((state) => state.updateCustomColors);
  const isSimpleMode = useDashboardStore((state) => state.isSimpleMode);
  
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and apply the active theme classes to body
  useEffect(() => {
    updateCustomColors({});
    // Simulate real-world latency / connection to data feed
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, [activeTheme, updateCustomColors]);

  return (
    <div className="min-h-screen bg-transparent text-text-primary flex flex-col font-sans select-none overflow-x-hidden antialiased relative">
      <ThemeTransitionOverlay />
      <AuroraBackground />
      <FloatingActionMenu />
      <CustomCursor />
      <WelcomeOverlay />
      <FinancialGlossary />
      
      {/* Floating Spatial Header Pill */}
      <DashboardHeader />
      
      {/* Workspace Area: Floating Catalog + Grid Canvas */}
      <div className="flex-1 flex flex-row min-h-0 relative">
        <WidgetCatalog />
        
        <main className="flex-1 overflow-y-auto h-[calc(100vh-100px)] scrollbar-thin px-4 md:px-8">
          {/* Welcome Banner */}
          <div className="pt-8 pb-4 select-none">
            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-b border-border-primary pb-4">
              <div>
                <h1 className="text-lg font-black tracking-widest font-sans text-text-primary uppercase drop-shadow-md">
                  Meridian Capital <span className="text-accent">•</span> Analytics
                </h1>
                <p className="text-[11px] text-text-muted font-mono mt-1 uppercase tracking-wider">
                  Institutional Portfolio Oversight • USD 45,000,000,000 Assets Under Management
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0 font-mono text-[10px] px-3 py-1.5 rounded-full bg-bg-tertiary border border-accent/30 shadow-[0_0_15px_rgba(251,146,60,0.1)] text-text-secondary select-none">
                <span className="w-2 h-2 rounded-full bg-status-success animate-pulse shadow-[0_0_8px_var(--color-status-success)]" />
                <span className="font-bold text-text-primary uppercase tracking-widest">FEED STATUS: DYNAMIC</span>
                <span className="text-accent">•</span>
                <span className="font-sans font-black text-accent uppercase tracking-widest">LIVE</span>
              </div>
            </div>
          </div>
          
          <MarketOverviewBanner />
          {isSimpleMode && <Finance101Banner />}

          {/* Grid canvas layout */}
          <div className="relative min-h-[800px]">
            {isLoading && (
              <div className="absolute inset-0 z-50 w-full px-4 md:px-6 py-6 bg-bg-primary">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-64 rounded-3xl bg-bg-secondary/40 border border-border-secondary shadow-2xl overflow-hidden relative">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className={`transition-opacity duration-1000 w-full h-full ${isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <GridCanvas />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
