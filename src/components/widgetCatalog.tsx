import React, { useState } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
import { WIDGET_REGISTRY } from '../registry/widgetRegistry';
import { Plus, LayoutGrid } from 'lucide-react';
import { WidgetCategory } from '../types';

export const WidgetCatalog: React.FC = () => {
  const { isEditing, addWidget, activeWidgets } = useDashboardStore();
  const [activeCategory, setActiveCategory] = useState<WidgetCategory | 'ALL'>('ALL');

  if (!isEditing) return null;

  const categories: (WidgetCategory | 'ALL')[] = ['ALL', 'CHART', 'TABLE', 'FEED', 'GAUGE', 'ANALYSIS'];

  const filteredWidgets = Object.entries(WIDGET_REGISTRY).filter(([_, def]) => {
    if (activeCategory === 'ALL') return true;
    return def.category === activeCategory;
  });

  return (
    <aside 
      className="w-80 border border-border-primary rounded-3xl ml-4 mt-4 mb-4 bg-bg-secondary/80 backdrop-blur-xl text-text-primary h-[calc(100vh-140px)] flex flex-col z-40 flex-shrink-0 animate-slide-right select-none shadow-panel transition-all duration-500 overflow-hidden"
      role="complementary"
      aria-label="Widget Catalog"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border-primary flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-accent" />
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-widest font-mono">Widget Catalogue</h3>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-accent/20 text-accent border border-accent/30">
          ADD MODE
        </span>
      </div>

      {/* Categories filters */}
      <div className="p-3 border-b border-border-primary/50 flex flex-wrap gap-1.5 flex-shrink-0">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            aria-label={`Filter by ${cat} category`}
            aria-pressed={activeCategory === cat}
            tabIndex={0}
            className={`
              px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase transition border focus:ring-2 focus:ring-accent focus:outline-none
              ${activeCategory === cat 
                ? 'bg-accent border-accent text-bg-primary font-black shadow-glow' 
                : 'bg-bg-primary border-border-primary text-text-muted hover:text-text-primary'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Catalog items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {filteredWidgets.map(([id, def]) => {
          const isAdded = activeWidgets.some(w => w.widgetId === id);
          
          return (
            <div 
              key={id}
              className="p-3 bg-bg-primary border border-border-primary hover:border-accent/40 rounded transition-all duration-200 flex flex-col group relative"
            >
              {/* Category tag */}
              <div className="flex justify-between items-start mb-1">
                <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-wider">
                  {def.id}
                </span>
                <span className="text-[8px] px-1.5 rounded font-mono font-bold bg-bg-tertiary text-text-muted border border-border-primary uppercase scale-90 origin-right">
                  {def.category}
                </span>
              </div>

              {/* Title */}
              <h4 className="text-[11px] font-bold text-text-primary tracking-wide font-sans mt-0.5">
                {def.name}
              </h4>
              
              {/* Description */}
              <p className="text-[10px] text-text-muted leading-relaxed font-sans mt-1">
                {def.description}
              </p>

              {/* Sizing metadata */}
              <div className="flex items-center gap-3 mt-3.5 text-[9px] font-mono text-text-secondary">
                <span>SIZE: {def.defaultSize.w}x{def.defaultSize.h}</span>
                <span>REFRESH: {def.dataSource.intervalMs / 1000}s</span>
              </div>

              {/* "+" Insert button */}
              <button
                onClick={() => addWidget(def.id, def.defaultSize)}
                aria-label={`Add ${def.name} widget to dashboard`}
                tabIndex={0}
                className={`
                  absolute right-3 bottom-3 p-1.5 rounded-full transition flex items-center justify-center shadow-panel focus:ring-2 focus:ring-accent focus:outline-none
                  ${isAdded 
                    ? 'bg-bg-tertiary hover:bg-border-primary border border-border-primary text-accent' 
                    : 'bg-accent hover:bg-accent-hover text-bg-primary font-bold shadow-glow'}
                `}
                title={isAdded ? 'Add another instance' : 'Add to grid canvas'}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
export default WidgetCatalog;
