import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WidgetComponentProps, MockHolding } from '../types';
import { ArrowLeft } from 'lucide-react';
import { gsap } from 'gsap';

interface TreemapNode {
  id: string;
  name: string;
  value: number; // Size (Market Value)
  pnlPercent: number; // Color value
  holdings?: MockHolding[];
}

export const W03_SectorHeatMap: React.FC<WidgetComponentProps<any, MockHolding[]>> = ({
  data,
  config,
}) => {
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const colorScheme = config.colorScheme || 'greenRed';

  // Group holdings by sector for top level view
  const sectorNodes = useMemo<TreemapNode[]>(() => {
    if (!data) return [];
    
    const groups: Record<string, MockHolding[]> = {};
    data.forEach((h) => {
      groups[h.sector] = groups[h.sector] || [];
      groups[h.sector].push(h);
    });

    return Object.entries(groups).map(([name, holdings]) => {
      const value = holdings.reduce((sum, h) => sum + h.marketValue, 0);
      const totalPnL = holdings.reduce((sum, h) => sum + (h.marketValue * h.dailyPnLPercent), 0);
      const pnlPercent = value > 0 ? parseFloat((totalPnL / value).toFixed(2)) : 0;
      
      return {
        id: name,
        name,
        value,
        pnlPercent,
        holdings
      };
    }).sort((a, b) => b.value - a.value);
  }, [data]);

  // Holdings inside the selected sector for zoomed view
  const holdingNodes = useMemo<TreemapNode[]>(() => {
    if (!data || !selectedSector) return [];
    
    const sector = sectorNodes.find(s => s.name === selectedSector);
    if (!sector || !sector.holdings) return [];

    return sector.holdings.map((h) => ({
      id: h.ticker,
      name: h.ticker,
      value: h.marketValue,
      pnlPercent: h.dailyPnLPercent
    })).sort((a, b) => b.value - a.value);
  }, [data, selectedSector, sectorNodes]);

  const activeNodes = selectedSector ? holdingNodes : sectorNodes;
  const totalValue = activeNodes.reduce((sum, n) => sum + n.value, 0);

  // Compute diverging colors
  const getColor = (pnl: number) => {
    // Normalise P&L between -2% and +2% for color intensity
    const normalized = Math.max(-1, Math.min(1, pnl / 2.0));
    
    if (colorScheme === 'greenRed') {
      if (normalized >= 0) {
        // Green color ramp
        const alpha = 0.3 + normalized * 0.7;
        return `rgba(16, 185, 129, ${alpha})`;
      } else {
        // Red color ramp
        const alpha = 0.3 + Math.abs(normalized) * 0.7;
        return `rgba(239, 68, 68, ${alpha})`;
      }
    } else {
      // Blue-Orange colorblind friendly scale
      if (normalized >= 0) {
        // Orange for positive
        const alpha = 0.3 + normalized * 0.7;
        return `rgba(245, 158, 11, ${alpha})`;
      } else {
        // Blue for negative
        const alpha = 0.3 + Math.abs(normalized) * 0.7;
        return `rgba(59, 130, 246, ${alpha})`;
      }
    }
  };

  const handleNodeClick = (node: TreemapNode) => {
    if (!selectedSector) {
      setSelectedSector(node.name);
    }
  };

  const handleBack = () => {
    setSelectedSector(null);
  };

  // Simple slice-and-dice grid partitioning layout algorithm for visual treemaps
  const layoutNodes = useMemo(() => {
    if (activeNodes.length === 0) return [];
    
    const containerWidth = 400; // virtual units
    const containerHeight = 220; // virtual units
    
    let remainingWidth = containerWidth;
    let remainingHeight = containerHeight;
    let offsetX = 0;
    let offsetY = 0;

    return activeNodes.map((node, index) => {
      const weight = node.value / totalValue;
      let w = 0;
      let h = 0;
      let x = offsetX;
      let y = offsetY;

      // Alternate directions (split vertically or horizontally depending on ratio)
      if (remainingWidth > remainingHeight) {
        w = remainingWidth * weight;
        h = remainingHeight;
        offsetX += w;
        remainingWidth -= w;
      } else {
        w = remainingWidth;
        h = remainingHeight * weight;
        offsetY += h;
        remainingHeight -= h;
      }

      // Handle small roundings / edge cases for last item
      if (index === activeNodes.length - 1) {
        if (remainingWidth > remainingHeight) {
          w = containerWidth - x;
        } else {
          h = containerHeight - y;
        }
      }

      return {
        ...node,
        layout: {
          x: `${(x / containerWidth) * 100}%`,
          y: `${(y / containerHeight) * 100}%`,
          width: `${(w / containerWidth) * 100}%`,
          height: `${(h / containerHeight) * 100}%`,
        }
      };
    });
  }, [activeNodes, totalValue]);

  useEffect(() => {
    if (containerRef.current && layoutNodes.length > 0) {
      const cells = containerRef.current.querySelectorAll('.heatmap-cell');
      gsap.fromTo(cells, 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.02, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [selectedSector, layoutNodes]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-text-muted">
        No heat map data available.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-secondary text-text-primary">
      {/* Zoom navigation breadcrumbs */}
      {selectedSector && (
        <div className="flex items-center mb-2 flex-shrink-0">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent-hover transition mr-2"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <span className="text-[11px] text-text-muted font-mono">
            / {selectedSector} allocation details
          </span>
        </div>
      )}

      {/* Main custom Treemap Grid */}
      <div ref={containerRef} className="flex-1 min-h-[160px] relative border border-border-primary rounded overflow-hidden bg-bg-primary">
        {layoutNodes.map((node) => {
          const bg = getColor(node.pnlPercent);
          const isPositive = node.pnlPercent >= 0;
          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node)}
              style={{
                position: 'absolute',
                left: node.layout.x,
                top: node.layout.y,
                width: node.layout.width,
                height: node.layout.height,
                backgroundColor: bg,
              }}
              className={`
                heatmap-cell border border-bg-secondary flex flex-col p-2 select-none group transition-all duration-300
                ${!selectedSector ? 'cursor-zoom-in hover:brightness-110 hover:z-10' : 'cursor-default'}
              `}
              title={`${node.name}\nMV: $${node.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}\nP&L: ${node.pnlPercent}%`}
            >
              <span className="text-[10px] font-mono font-bold text-white uppercase truncate drop-shadow-md">
                {node.name}
              </span>
              <span className="text-[9px] font-mono font-bold text-white/90 mt-0.5 drop-shadow-sm">
                {isPositive ? '+' : ''}{node.pnlPercent}%
              </span>
              <span className="hidden group-hover:block text-[8px] font-mono text-white/70 mt-auto truncate">
                ${node.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default W03_SectorHeatMap;
