import React, { useState, useMemo, useEffect } from 'react';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { WidgetComponentProps, MockHolding } from '../types';
import { ArrowLeft } from 'lucide-react';
import { gsap } from 'gsap';

interface GroupedDataPoint {
  name: string;
  value: number; // market value
  percentage: number;
  color: string;
}

export const W01_PortfolioAllocation: React.FC<WidgetComponentProps<any, MockHolding[]>> = ({
  data,
  config,
}) => {
  const [drilldownGroup, setDrilldownGroup] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<GroupedDataPoint | null>(null);

  const dimension = config.dimension || 'sector';
  const chartStyle = config.style || 'donut';

  // Curated fallback charts color palette
  const COLORS = useMemo(() => [
    'var(--color-chart-1)',
    'var(--color-chart-2)',
    'var(--color-chart-3)',
    'var(--color-chart-4)',
    'var(--color-chart-5)',
    'var(--color-chart-6)',
  ], []);

  // Stable color mappings for sectors and asset classes to ensure visual color consistency
  const SECTOR_COLORS: Record<string, string> = {
    'Technology': 'var(--color-chart-1)',
    'Financials': 'var(--color-chart-2)',
    'Healthcare': 'var(--color-chart-3)',
    'Consumer Discretionary': 'var(--color-chart-4)',
    'Energy': 'var(--color-chart-5)',
    'Industrials': 'var(--color-chart-6)',
    'Materials': 'var(--color-chart-3)',
    'Utilities': 'var(--color-chart-4)',
    'Real Estate': 'var(--color-chart-1)',
    'Communication Services': 'var(--color-chart-2)',
  };

  const ASSET_CLASS_COLORS: Record<string, string> = {
    'Equity': 'var(--color-chart-1)',
    'Fixed Income': 'var(--color-chart-2)',
    'Derivative': 'var(--color-chart-3)',
    'Alternative': 'var(--color-chart-4)',
  };

  const getColorForName = (name: string, index: number) => {
    if (dimension === 'sector') {
      return SECTOR_COLORS[name] || COLORS[index % COLORS.length];
    }
    if (dimension === 'assetClass') {
      return ASSET_CLASS_COLORS[name] || COLORS[index % COLORS.length];
    }
    return COLORS[index % COLORS.length];
  };

  // Top level grouping aggregation
  const topLevelGrouped = useMemo<GroupedDataPoint[]>(() => {
    if (!data) return [];
    
    const aggregates: Record<string, number> = {};
    let totalMV = 0;
    
    data.forEach((h) => {
      const key = h[dimension as keyof MockHolding] as string;
      aggregates[key] = (aggregates[key] || 0) + h.marketValue;
      totalMV += h.marketValue;
    });

    return Object.entries(aggregates).map(([name, value]) => ({
      name,
      value,
      percentage: parseFloat(((value / totalMV) * 100).toFixed(2)),
      color: '' // set below to ensure stable reference
    })).map((d, index) => ({
      ...d,
      color: getColorForName(d.name, index)
    })).sort((a, b) => b.value - a.value);
  }, [data, dimension, COLORS]);

  // Drilldown level grouping aggregation (assets inside a selected sector/asset class)
  const drilldownGrouped = useMemo<GroupedDataPoint[]>(() => {
    if (!data || !drilldownGroup) return [];
    
    const filtered = data.filter(h => (h[dimension as keyof MockHolding] as string) === drilldownGroup);
    const totalMV = filtered.reduce((sum, h) => sum + h.marketValue, 0);

    return filtered.map((h, index) => ({
      name: h.ticker,
      value: h.marketValue,
      percentage: parseFloat(((h.marketValue / totalMV) * 100).toFixed(2)),
      color: COLORS[index % COLORS.length]
    })).sort((a, b) => b.value - a.value);
  }, [data, drilldownGroup, dimension, COLORS]);

  const activeData = drilldownGroup ? drilldownGrouped : topLevelGrouped;

  // Stagger entrance of the legend list items
  useEffect(() => {
    if (activeData.length > 0) {
      gsap.killTweensOf('.allocation-legend-item');
      gsap.fromTo('.allocation-legend-item',
        { opacity: 0, x: 10 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.45, 
          stagger: 0.04, 
          ease: 'power2.out',
          clearProps: 'all'
        }
      );
    }
  }, [drilldownGroup, dimension]);

  const onPieClick = (element: any) => {
    if (!drilldownGroup && element && element.name) {
      setDrilldownGroup(element.name);
      setActiveIndex(null);
      setHoveredSlice(null);
    }
  };

  const handleBack = () => {
    setDrilldownGroup(null);
    setActiveIndex(null);
    setHoveredSlice(null);
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-text-muted">
        No portfolio holdings data available.
      </div>
    );
  }

  const totalValue = activeData.reduce((sum, d) => sum + d.value, 0);

  const formatLargeNumber = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    if (val >= 1e3) return `$${(val / 1e3).toFixed(2)}K`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary text-text-primary p-1">
      {/* Header bar for drilldowns */}
      {drilldownGroup && (
        <div className="flex items-center mb-2 flex-shrink-0">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent-hover transition mr-2"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <span className="text-[10px] text-text-muted font-mono truncate">
            / {drilldownGroup} holdings allocation
          </span>
        </div>
      )}

      {/* Main visualization container split into pie and legends */}
      <div className="flex flex-col md:flex-row flex-1 items-center justify-center gap-4 min-h-0">
        
        {/* Pie Container */}
        <div className="w-full md:w-1/2 h-full min-h-[160px] relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={activeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={chartStyle === 'donut' ? '70%' : '0%'}
                outerRadius="90%"
                paddingAngle={6}
                cornerRadius={12}
                onClick={onPieClick}
                cursor={drilldownGroup ? 'default' : 'pointer'}
                label={false} // turned off outer labels to prevent overlapping layout clutter
                stroke="none"
              >
                {activeData.map((entry, idx) => (
                  <Cell 
                    key={`cell-${idx}`} 
                    fill={entry.color} 
                    stroke="none"
                    onMouseEnter={() => {
                      setActiveIndex(idx);
                      setHoveredSlice(entry);
                    }}
                    onMouseLeave={() => {
                      setActiveIndex(null);
                      setHoveredSlice(null);
                    }}
                    style={{
                      filter: activeIndex === idx ? 'brightness(1.1) drop-shadow(0 0 5px rgba(255,255,255,0.15))' : 'none',
                      transition: 'all 0.25s ease-in-out'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(val: any) => [formatLargeNumber(val), 'Market Value']}
                contentStyle={{
                  backgroundColor: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--color-text-primary)'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>

          {/* Interactive center-text overlay for the donut chart */}
          {chartStyle === 'donut' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest text-center">
                {hoveredSlice ? hoveredSlice.name : 'TOTAL AUM'}
              </span>
              <span className="text-3xl font-black font-sans text-text-primary mt-1 tracking-tighter shadow-sm drop-shadow-md">
                {hoveredSlice 
                  ? `${hoveredSlice.percentage}%` 
                  : '100%'}
              </span>
              <span className="text-[11px] font-mono text-accent mt-1 font-bold">
                {hoveredSlice 
                  ? formatLargeNumber(hoveredSlice.value) 
                  : formatLargeNumber(totalValue)}
              </span>
            </div>
          )}
        </div>

        {/* Dynamic customized legend panel with hover linkages */}
        <div className="w-full md:w-1/2 overflow-y-auto max-h-[140px] md:max-h-full pr-1 space-y-1.5 scrollbar-thin flex-shrink-0">
          {activeData.map((d, idx) => (
            <div 
              key={d.name}
              onMouseEnter={() => {
                setActiveIndex(idx);
                setHoveredSlice(d);
              }}
              onMouseLeave={() => {
                setActiveIndex(null);
                setHoveredSlice(null);
              }}
              onClick={() => !drilldownGroup && setDrilldownGroup(d.name)}
              className={`
                allocation-legend-item flex flex-col p-1.5 rounded transition cursor-pointer hover:bg-bg-tertiary table-row-hover
                ${activeIndex === idx ? 'bg-bg-tertiary' : ''}
              `}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-200" 
                    style={{ 
                      backgroundColor: d.color,
                      transform: activeIndex === idx ? 'scale(1.25)' : 'scale(1)'
                    }} 
                  />
                  <span className="text-[11px] font-sans font-bold text-text-primary truncate uppercase">{d.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-right flex-shrink-0 text-text-secondary">
                  <span>{formatLargeNumber(d.value)}</span>
                  <span className="w-10 font-bold text-accent">{d.percentage}%</span>
                </div>
              </div>
              <div className="w-full h-1 bg-border-primary mt-1 rounded overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 ease-out" 
                  style={{ width: `${d.percentage}%`, backgroundColor: d.color }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default W01_PortfolioAllocation;
