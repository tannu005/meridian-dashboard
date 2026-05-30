import React from 'react';
import { WidgetComponentProps, PortfolioSummary } from '../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AnimatedCounter } from '../components/AnimatedCounter';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

import { io } from 'socket.io-client';

export const W10_MarketTicker: React.FC<WidgetComponentProps<any, PortfolioSummary>> = () => {
  const [workerItems, setWorkerItems] = React.useState<TickerItem[]>([]);

  React.useEffect(() => {
    // Connect to secure WebSocket stream
    const socket = io({ withCredentials: true });
    
    socket.on('connect', () => {
      // Simulate high-frequency updates (250ms interval) to prove performance scale
      socket.emit('subscribe_market_data', { intervalMs: 250 });
    });
    
    socket.on('market_data_batch', (data: TickerItem[]) => {
      setWorkerItems(data);
    });
    
    return () => {
      socket.emit('unsubscribe_market_data');
      socket.disconnect();
    };
  }, []);

  const items = workerItems.length > 0 ? workerItems : [];

  const renderSparkline = (points: number[], isPositive: boolean) => {
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const width = 50;
    const height = 18;
    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible ml-2 flex-shrink-0">
        <polyline
          fill="none"
          stroke={isPositive ? 'var(--color-success)' : 'var(--color-danger)'}
          strokeWidth="1.5"
          points={coords}
        />
      </svg>
    );
  };

  const speedClass = 'marquee-content';

  // Duplicate items twice to ensure perfect seamless loops on wide monitors
  const listItems = [...items, ...items, ...items];

  return (
    <div className="flex items-center h-full overflow-hidden select-none bg-bg-secondary">
      <div className="marquee-ticker w-full">
        <div className={`${speedClass} flex items-center gap-6`}>
          {listItems.map((item, idx) => {
            const isPositive = item.change >= 0;
            const sign = isPositive ? '+' : '';
            return (
              <div 
                key={`${item.symbol}-${idx}`} 
                className="flex items-center gap-2 border-r border-border-primary pr-6 flex-shrink-0"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-text-primary uppercase tracking-wider">
                      {item.symbol}
                    </span>
                    <span className="text-[9px] font-sans text-text-muted">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <AnimatedCounter 
                      value={item.price} 
                      decimals={2} 
                      className="text-[11px] font-mono font-bold text-text-primary" 
                    />
                    <span className={`flex items-center text-[9px] font-mono font-bold ${isPositive ? 'text-status-success' : 'text-status-danger'}`}>
                      {isPositive ? <ArrowUpRight className="w-2.5 h-2.5 flex-shrink-0" /> : <ArrowDownRight className="w-2.5 h-2.5 flex-shrink-0" />}
                      <span className="flex items-center gap-0.5">
                        {sign}
                        <AnimatedCounter value={item.changePercent} decimals={2} suffix="%" />
                      </span>
                    </span>
                  </div>
                </div>
                {renderSparkline(item.sparkline, isPositive)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default W10_MarketTicker;
