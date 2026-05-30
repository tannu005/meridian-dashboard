import React, { useMemo, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useRealTimeData } from '../hooks/useRealTimeData';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

export const MarketOverviewBanner: React.FC = () => {
  const { data, lastUpdated } = useRealTimeData<any>('summary', 5000);
  const containerRef = useRef<HTMLDivElement>(null);

  const items = useMemo<TickerItem[]>(() => {
    const scale = data ? data.aumChangePercent24h : 0.85;
    
    return [
      { symbol: '^NSEI', name: 'Nifty 50', price: 23145.80, change: 185.20 * scale, changePercent: 0.81 * scale, sparkline: [120, 122, 119, 125, 124, 128, 132] },
      { symbol: '^BSESN', name: 'Sensex', price: 76110.15, change: 610.45 * scale, changePercent: 0.80 * scale, sparkline: [75, 78, 74, 82, 80, 85, 89] },
      { symbol: '^GSPC', name: 'S&P 500', price: 5304.72, change: 42.15 * scale, changePercent: 0.79 * scale, sparkline: [40, 42, 38, 45, 43, 48, 51] },
      { symbol: '^FTSE', name: 'FTSE 100', price: 8312.45, change: -12.30 * scale, changePercent: -0.15 * scale, sparkline: [85, 83, 80, 82, 79, 78, 76] },
      { symbol: 'USDINR=X', name: 'USD/INR', price: 83.425, change: 0.042 * scale, changePercent: 0.05 * scale, sparkline: [10, 12, 11, 14, 13, 15, 16] },
      { symbol: 'GC=F', name: 'Gold', price: 2342.60, change: 14.80 * scale, changePercent: 0.63 * scale, sparkline: [20, 22, 25, 24, 28, 30, 32] },
    ];
  }, [data]);

  // Flash animation on data update
  useEffect(() => {
    if (containerRef.current && lastUpdated) {
      const el = containerRef.current;
      el.classList.remove('animate-pulse-glow');
      void el.offsetWidth; // trigger reflow
      el.classList.add('animate-pulse-glow');
    }
  }, [lastUpdated]);

  const renderSparkline = (points: number[], isPositive: boolean) => {
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const width = 60;
    const height = 24;
    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible flex-shrink-0">
        <polyline
          fill="none"
          stroke={isPositive ? 'var(--color-success)' : 'var(--color-danger)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  return (
    <div className="px-4 md:px-6 pt-2 pb-4 select-none">
      <div 
        ref={containerRef}
        className="flex flex-wrap items-center gap-4 bg-bg-secondary border border-border-primary rounded-xl p-4 shadow-panel"
      >
        <div className="hidden lg:flex items-center gap-2 mr-2 pr-4 border-r border-border-primary/50">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-black font-sans uppercase tracking-widest text-text-primary">
            Live Market
          </span>
        </div>

        <div className="flex-1 flex flex-wrap justify-between items-center gap-4">
          {items.map((item) => {
            const isPositive = item.change >= 0;
            const sign = isPositive ? '+' : '';
            return (
              <div key={item.symbol} className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-sans font-bold text-text-muted uppercase tracking-wider mb-0.5">
                    {item.name}
                  </span>
                  <div className="flex items-end gap-2">
                    <span className="text-sm font-mono font-black text-text-primary">
                      {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`flex items-center text-[10px] font-mono font-bold mb-0.5 px-1 py-0.5 rounded ${isPositive ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger'}`}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3 flex-shrink-0 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 flex-shrink-0 mr-0.5" />}
                      <span>{sign}{item.changePercent.toFixed(2)}%</span>
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  {renderSparkline(item.sparkline, isPositive)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
