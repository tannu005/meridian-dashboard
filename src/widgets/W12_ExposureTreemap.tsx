import React, { useState, useMemo } from 'react';
import { WidgetComponentProps, ExposureDataPoint } from '../types';
import { ArrowLeft } from 'lucide-react';

interface TreemapItem {
  id: string;
  name: string;
  value: number;
  pnlPercent: number;
}

export const W12_ExposureTreemap: React.FC<WidgetComponentProps<any, ExposureDataPoint[]>> = ({
  data,
  config,
}) => {
  // Navigation levels
  // level 0: Geography (India, US, Europe)
  // level 1: Asset inside Geography (e.g. India/Equities, India/Fixed Income)
  const [activeGeo, setActiveGeo] = useState<string | null>(null);

  const sizeMetric = config.sizeMetric || 'marketValue';

  // Group by Geography (Level 1)
  const geoNodes = useMemo<TreemapItem[]>(() => {
    if (!data) return [];
    
    const geos: Record<string, { value: number; pnlWeighted: number }> = {};
    
    data.forEach((d) => {
      const geo = d.path.split('/')[0];
      const val = sizeMetric === 'riskContribution' 
        ? d.value * (d.path.includes('Derivatives') ? 2.5 : 1.0) // Derivatives represent high risk
        : d.value;
      
      if (!geos[geo]) {
        geos[geo] = { value: 0, pnlWeighted: 0 };
      }
      
      geos[geo].value += val;
      geos[geo].pnlWeighted += val * d.pnlPercent;
    });

    return Object.entries(geos).map(([name, obj]) => ({
      id: name,
      name,
      value: obj.value,
      pnlPercent: obj.value > 0 ? parseFloat((obj.pnlWeighted / obj.value).toFixed(2)) : 0
    })).sort((a, b) => b.value - a.value);
  }, [data, sizeMetric]);

  // Group by Asset Class within chosen Geography (Level 2)
  const assetNodes = useMemo<TreemapItem[]>(() => {
    if (!data || !activeGeo) return [];
    
    const assets: Record<string, { value: number; pnlWeighted: number }> = {};
    
    data
      .filter((d) => d.path.startsWith(activeGeo))
      .forEach((d) => {
        const asset = d.path.split('/')[1];
        const val = sizeMetric === 'riskContribution'
          ? d.value * (asset.includes('Derivatives') ? 2.5 : 1.0)
          : d.value;

        if (!assets[asset]) {
          assets[asset] = { value: 0, pnlWeighted: 0 };
        }

        assets[asset].value += val;
        assets[asset].pnlWeighted += val * d.pnlPercent;
      });

    return Object.entries(assets).map(([name, obj]) => ({
      id: `${activeGeo}.${name}`,
      name,
      value: obj.value,
      pnlPercent: obj.value > 0 ? parseFloat((obj.pnlWeighted / obj.value).toFixed(2)) : 0
    })).sort((a, b) => b.value - a.value);
  }, [data, activeGeo, sizeMetric]);

  const activeNodes = activeGeo ? assetNodes : geoNodes;
  const totalValue = activeNodes.reduce((sum, n) => sum + n.value, 0);

  const handleNodeClick = (node: TreemapItem) => {
    if (!activeGeo) {
      setActiveGeo(node.name);
    }
  };

  const getColor = (pnl: number) => {
    const norm = Math.max(-1, Math.min(1, pnl / 1.5));
    if (norm >= 0) {
      return `rgba(16, 185, 129, ${0.3 + norm * 0.7})`; // Emerald green
    } else {
      return `rgba(239, 68, 68, ${0.3 + Math.abs(norm) * 0.7})`; // Red
    }
  };

  // Squarish Grid slice-and-dice layout logic
  const layoutNodes = useMemo(() => {
    if (activeNodes.length === 0) return [];
    
    const containerW = 400;
    const containerH = 220;
    
    let remW = containerW;
    let remH = containerH;
    let offX = 0;
    let offY = 0;

    return activeNodes.map((node, idx) => {
      const weight = node.value / totalValue;
      let w = 0;
      let h = 0;
      let x = offX;
      let y = offY;

      if (remW > remH) {
        w = remW * weight;
        h = remH;
        offX += w;
        remW -= w;
      } else {
        w = remW;
        h = remH * weight;
        offY += h;
        remH -= h;
      }

      if (idx === activeNodes.length - 1) {
        if (remW > remH) w = containerW - x;
        else h = containerH - y;
      }

      return {
        ...node,
        layout: {
          x: `${(x / containerW) * 100}%`,
          y: `${(y / containerH) * 100}%`,
          width: `${(w / containerW) * 100}%`,
          height: `${(h / containerH) * 100}%`,
        }
      };
    });
  }, [activeNodes, totalValue]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-text-muted">
        No exposure metrics available.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-secondary text-text-primary">
      {/* Dynamic Navigation Breadcrumbs */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center min-w-0">
          {activeGeo && (
            <button 
              onClick={() => setActiveGeo(null)}
              className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent-hover transition mr-2"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
          )}
          <span className="text-[11px] text-text-muted font-mono truncate">
            {activeGeo ? `/ ${activeGeo} exposure breakdown` : '/ Global exposure mix'}
          </span>
        </div>
        <span className="text-[9px] font-mono text-text-muted uppercase hidden sm:inline">
          METRIC: {sizeMetric === 'riskContribution' ? 'RISK WT' : 'AUM WEIGHT'}
        </span>
      </div>

      {/* Interactive Treemap SVG viewport */}
      <div className="flex-1 min-h-[160px] relative border border-border-primary rounded overflow-hidden bg-bg-primary">
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
                border border-bg-secondary flex flex-col p-2.5 select-none transition-all duration-300
                ${!activeGeo ? 'cursor-zoom-in hover:brightness-110 hover:z-10' : 'cursor-default'}
              `}
              title={`${node.name}\nExposure: $${(node.value/1000000).toFixed(1)}M\nP&L: ${node.pnlPercent}%`}
            >
              <span className="text-[10px] font-mono font-bold text-white uppercase truncate drop-shadow-md">
                {node.name}
              </span>
              <span className="text-[9px] font-mono font-bold text-white/80 mt-0.5 drop-shadow-sm">
                {isPositive ? '+' : ''}{node.pnlPercent}%
              </span>
              <span className="text-[8px] font-mono text-white/60 mt-auto truncate">
                ${(node.value/1000000).toFixed(1)}M
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default W12_ExposureTreemap;
