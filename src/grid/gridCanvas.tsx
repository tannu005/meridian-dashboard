import React, { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { Responsive, Layout } from 'react-grid-layout';
import { useDashboardStore } from '../store/dashboardStore';
import { WIDGET_REGISTRY } from '../registry/widgetRegistry';
import { WidgetShell } from '../components/widgetShell';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { TiltWrapper } from '../components/TiltWrapper';
import { SpotlightCard } from '../components/SpotlightCard';
import { motion } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Table, 
  Newspaper,
  Grid 
} from 'lucide-react';

const ResponsiveGrid: any = Responsive;

// Sub-component to bind data to lazy-loaded widgets
const WidgetBinder: React.FC<{
  instanceId: string;
  widgetId: string;
  config: Record<string, any>;
}> = ({ instanceId, widgetId, config }) => {
  const definition = WIDGET_REGISTRY[widgetId];
  if (!definition) return <div>Unknown Widget Type</div>;

  // Retrieve current widget config
  const activeConfig = { ...definition.defaultConfig, ...config };
  
  // Custom real-time data subscription
  const { data, lastUpdated, isStale, isLoading, error, refetch } = useRealTimeData<any>(
    definition.dataSource.channel,
    definition.dataSource.intervalMs
  );

  return (
    <WidgetShell
      instance={{ id: instanceId, widgetId, layout: {} as any, config }}
      definition={definition}
      isLoading={isLoading}
      isStale={isStale}
      lastUpdated={lastUpdated}
      error={error}
      refetch={refetch}
    >
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-accent" />
        </div>
      }>
        <definition.component
          instanceId={instanceId}
          config={activeConfig}
          data={data}
          isStale={isStale}
          lastUpdated={lastUpdated}
          refetch={refetch}
        />
      </Suspense>
    </WidgetShell>
  );
};

export const GridCanvas: React.FC = () => {
  const activeWidgets = useDashboardStore((state) => state.activeWidgets);
  const rowHeight = useDashboardStore((state) => state.rowHeight);
  const gap = useDashboardStore((state) => state.gap);
  const isEditing = useDashboardStore((state) => state.isEditing);
  const updateWidgetLayouts = useDashboardStore((state) => state.updateWidgetLayouts);

  // ResizeObserver Width tracking for react-grid-layout responsiveness
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(1200);

  // Accordion collapsed state for news, holdings, and analytics
  const [collapsed, setCollapsed] = useState({
    analytics: false,
    holdings: false,
    news: false,
  });

  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setGridWidth(entry.contentRect.width);
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Partition active widgets into three sections
  const analyticsWidgets = useMemo(() => {
    return activeWidgets.filter((w) => {
      const cat = WIDGET_REGISTRY[w.widgetId]?.category;
      return cat === 'CHART' || cat === 'GAUGE' || cat === 'ANALYSIS';
    });
  }, [activeWidgets]);

  const holdingsWidgets = useMemo(() => {
    return activeWidgets.filter((w) => {
      return WIDGET_REGISTRY[w.widgetId]?.category === 'TABLE';
    });
  }, [activeWidgets]);

  const newsWidgets = useMemo(() => {
    return activeWidgets.filter((w) => {
      const cat = WIDGET_REGISTRY[w.widgetId]?.category;
      return cat === 'FEED';
    });
  }, [activeWidgets]);

  // Helper to map layout configs
  const getRglLayout = (widgetsList: typeof activeWidgets) => {
    return widgetsList.map((w) => ({
      i: w.id,
      x: w.layout.x,
      y: w.layout.y,
      w: w.layout.w,
      h: w.layout.h,
      minW: WIDGET_REGISTRY[w.widgetId]?.minSize.w || 2,
      minH: WIDGET_REGISTRY[w.widgetId]?.minSize.h || 2,
    }));
  };

  const handleLayoutChange = (newLayouts: Layout) => {
    if (isEditing) {
      updateWidgetLayouts(newLayouts as any);
    }
  };

  const toggleSection = (section: keyof typeof collapsed) => {
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isMobile = gridWidth < 768;

  if (activeWidgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center relative group">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNNjAgMEwwIDB2NjBoNjBWMHptLTU5IDU5VjFoNTh2NThIMXoiLz48L2c+PC9zdmc+')] opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"></div>
        
        {/* Central Graphic */}
        <div className="relative mb-6 flex justify-center items-center">
          <div className="absolute -inset-10 bg-accent/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="absolute bg-bg-secondary p-4 rounded-xl border border-border-secondary shadow-xl -rotate-6 group-hover:-rotate-12 transition-transform duration-500 opacity-50">
            <Table className="w-10 h-10 text-text-muted" />
          </div>
          
          <div className="relative bg-bg-secondary p-5 rounded-2xl border border-border-primary shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 z-10">
            <Layers className="w-12 h-12 text-accent" />
          </div>
        </div>

        <h2 className="text-xl font-black tracking-widest font-sans text-text-primary uppercase mb-2">
          Canvas <span className="text-accent">Awaiting</span> Telemetry
        </h2>
        <p className="text-sm text-text-muted max-w-md mb-8 leading-relaxed font-sans">
          Your institutional workspace is empty. Construct your terminal by mounting widgets from the live data catalog.
        </p>

        <button 
          onClick={() => useDashboardStore.getState().setEditing(true)}
          className="relative inline-flex items-center gap-2 px-8 py-3 bg-accent text-bg-primary font-bold font-sans rounded-full overflow-hidden group hover:scale-105 transition-transform shadow-[0_0_20px_rgba(251,146,60,0.3)]"
        >
          <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <Grid className="w-4 h-4 relative z-10" />
          <span className="relative z-10 uppercase tracking-widest text-xs">Open Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full relative px-2 md:px-4 pb-20 space-y-6">
      
      {/* 1. Analytics & Risk Accordion Section */}
      {analyticsWidgets.length > 0 && (
        <div className="border border-border-primary rounded-lg overflow-hidden bg-bg-secondary/45 backdrop-blur-md">
          <button
            onClick={() => toggleSection('analytics')}
            aria-expanded={!collapsed.analytics}
            className="w-full flex items-center justify-between px-4 py-3 bg-bg-tertiary/70 hover:bg-bg-tertiary transition font-sans font-bold text-xs uppercase tracking-wider text-text-primary focus:ring-2 focus:ring-accent focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-accent" />
              <span>Portfolio Analytics & Risk Metrics</span>
              <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-bg-primary text-text-muted border border-border-primary">
                {analyticsWidgets.length} WIDGETS
              </span>
            </div>
            {collapsed.analytics ? <ChevronRight className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
          </button>
          
          {!collapsed.analytics && (
            <div className="p-3 animate-fade-in">
              <ResponsiveGrid
                className="layout"
                layouts={{ xxl: getRglLayout(analyticsWidgets), xl: getRglLayout(analyticsWidgets), lg: getRglLayout(analyticsWidgets), md: getRglLayout(analyticsWidgets) }}
                width={gridWidth - 24} // account for padding inside section container
                breakpoints={{ xxl: 2560, xl: 1920, lg: 1280, md: 996, sm: 768, xs: 480 }}
                cols={{ xxl: 16, xl: 12, lg: 12, md: 12, sm: 1, xs: 1 }}
                rowHeight={rowHeight}
                margin={[gap, gap]}
                containerPadding={[0, 0]}
                isDraggable={isEditing && !isMobile}
                isResizable={isEditing && !isMobile}
                onLayoutChange={handleLayoutChange}
                draggableHandle=".drag-handle"
                useCSSTransforms={true}
                compactType="vertical"
                preventCollision={false}
              >
                {analyticsWidgets.map((w, index) => (
                  <SpotlightCard key={w.id} className="widget-container">
                    <motion.div 
                      className="w-full h-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
                    >
                      <TiltWrapper>
                        <WidgetBinder 
                          instanceId={w.id} 
                          widgetId={w.widgetId} 
                          config={w.config} 
                        />
                      </TiltWrapper>
                    </motion.div>
                  </SpotlightCard>
                ))}
              </ResponsiveGrid>
            </div>
          )}
        </div>
      )}

      {/* 2. Holdings Accordion Section */}
      {holdingsWidgets.length > 0 && (
        <div className="border border-border-primary rounded-lg overflow-hidden bg-bg-secondary/45 backdrop-blur-md">
          <button
            onClick={() => toggleSection('holdings')}
            aria-expanded={!collapsed.holdings}
            className="w-full flex items-center justify-between px-4 py-3 bg-bg-tertiary/70 hover:bg-bg-tertiary transition font-sans font-bold text-xs uppercase tracking-wider text-text-primary focus:ring-2 focus:ring-accent focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-accent" />
              <span>Asset Holdings Data Grid</span>
              <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-bg-primary text-text-muted border border-border-primary">
                {holdingsWidgets.length} WIDGET
              </span>
            </div>
            {collapsed.holdings ? <ChevronRight className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
          </button>
          
          {!collapsed.holdings && (
            <div className="p-3 animate-fade-in">
              <ResponsiveGrid
                className="layout"
                layouts={{ xxl: getRglLayout(holdingsWidgets), xl: getRglLayout(holdingsWidgets), lg: getRglLayout(holdingsWidgets), md: getRglLayout(holdingsWidgets) }}
                width={gridWidth - 24}
                breakpoints={{ xxl: 2560, xl: 1920, lg: 1280, md: 996, sm: 768, xs: 480 }}
                cols={{ xxl: 16, xl: 12, lg: 12, md: 12, sm: 1, xs: 1 }}
                rowHeight={rowHeight}
                margin={[gap, gap]}
                containerPadding={[0, 0]}
                isDraggable={isEditing && !isMobile}
                isResizable={isEditing && !isMobile}
                onLayoutChange={handleLayoutChange}
                draggableHandle=".drag-handle"
                useCSSTransforms={true}
                compactType="vertical"
                preventCollision={false}
              >
                {holdingsWidgets.map((w, index) => (
                  <SpotlightCard key={w.id} className="widget-container">
                    <motion.div 
                      className="w-full h-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (analyticsWidgets.length + index) * 0.1, duration: 0.5, ease: "easeOut" }}
                    >
                      <TiltWrapper>
                        <WidgetBinder 
                          instanceId={w.id} 
                          widgetId={w.widgetId} 
                          config={w.config} 
                        />
                      </TiltWrapper>
                    </motion.div>
                  </SpotlightCard>
                ))}
              </ResponsiveGrid>
            </div>
          )}
        </div>
      )}

      {/* 3. News & Alerts Accordion Section */}
      {newsWidgets.length > 0 && (
        <div className="border border-border-primary rounded-lg overflow-hidden bg-bg-secondary/45 backdrop-blur-md">
          <button
            onClick={() => toggleSection('news')}
            aria-expanded={!collapsed.news}
            className="w-full flex items-center justify-between px-4 py-3 bg-bg-tertiary/70 hover:bg-bg-tertiary transition font-sans font-bold text-xs uppercase tracking-wider text-text-primary focus:ring-2 focus:ring-accent focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-accent" />
              <span>Market News & Intelligence Wires</span>
              <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-bg-primary text-text-muted border border-border-primary">
                {newsWidgets.length} WIDGETS
              </span>
            </div>
            {collapsed.news ? <ChevronRight className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
          </button>
          
          {!collapsed.news && (
            <div className="p-3 animate-fade-in">
              <ResponsiveGrid
                className="layout"
                layouts={{ xxl: getRglLayout(newsWidgets), xl: getRglLayout(newsWidgets), lg: getRglLayout(newsWidgets), md: getRglLayout(newsWidgets) }}
                width={gridWidth - 24}
                breakpoints={{ xxl: 2560, xl: 1920, lg: 1280, md: 996, sm: 768, xs: 480 }}
                cols={{ xxl: 16, xl: 12, lg: 12, md: 12, sm: 1, xs: 1 }}
                rowHeight={rowHeight}
                margin={[gap, gap]}
                containerPadding={[0, 0]}
                isDraggable={isEditing && !isMobile}
                isResizable={isEditing && !isMobile}
                onLayoutChange={handleLayoutChange}
                draggableHandle=".drag-handle"
                useCSSTransforms={true}
                compactType="vertical"
                preventCollision={false}
              >
                {newsWidgets.map((w, index) => (
                  <SpotlightCard key={w.id} className="widget-container">
                    <motion.div 
                      className="w-full h-full"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (analyticsWidgets.length + holdingsWidgets.length + index) * 0.1, duration: 0.5, ease: "easeOut" }}
                    >
                      <TiltWrapper>
                        <WidgetBinder 
                          instanceId={w.id} 
                          widgetId={w.widgetId} 
                          config={w.config} 
                        />
                      </TiltWrapper>
                    </motion.div>
                  </SpotlightCard>
                ))}
              </ResponsiveGrid>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default GridCanvas;
