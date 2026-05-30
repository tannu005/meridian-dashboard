import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Brush 
} from 'recharts';
import { WidgetComponentProps, NavDataPoint } from '../types';

export const W02_PerformanceLine: React.FC<WidgetComponentProps<any, NavDataPoint[]>> = ({
  data,
  config,
}) => {
  const benchmark = config.benchmark || 'nifty50';
  const scaleType = config.scaleType || 'linear';
  const dateRange = config.dateRange || '3M';

  // Filter and Normalize/Reindex data series to base 100 at start of range
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Slice data by date range
    let cutLength = 90; // Default 3M
    if (dateRange === '1W') cutLength = 7;
    if (dateRange === '1M') cutLength = 30;
    if (dateRange === '3M') cutLength = 90;
    if (dateRange === '6M') cutLength = 180;
    if (dateRange === 'YTD') cutLength = 140; // approx
    if (dateRange === '1Y') cutLength = 252;
    
    const sliced = data.slice(-cutLength);
    if (sliced.length === 0) return [];
    
    // Reindex to Base 100 at the start of the window
    const baseNav = sliced[0].nav;
    const baseNifty = sliced[0].nifty50;
    const baseSP = sliced[0].sp500;
    
    return sliced.map((pt) => ({
      date: pt.date,
      // Reindexed prices
      Portfolio: parseFloat(((pt.nav / baseNav) * 100).toFixed(2)),
      'Nifty 50': parseFloat(((pt.nifty50 / baseNifty) * 100).toFixed(2)),
      'S&P 500': parseFloat(((pt.sp500 / baseSP) * 100).toFixed(2)),
      // Raw references for tooltips
      rawNav: pt.nav,
      rawNifty: pt.nifty50,
      rawSP: pt.sp500
    }));
  }, [data, dateRange]);

  if (!data || data.length === 0 || processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-text-muted">
        No performance NAV time series available.
      </div>
    );
  }

  // Determine which lines to draw based on configuration
  const showNifty = benchmark === 'nifty50' || benchmark === 'both';
  const showSP = benchmark === 'sp500' || benchmark === 'both';

  return (
    <div className="flex flex-col h-full bg-bg-secondary text-text-primary">
      <div className="text-[10px] text-text-muted font-mono mb-2 uppercase flex items-center justify-between">
        <span>Performance indexed to 100 at start of range ({processedData[0]?.date})</span>
        <span className="text-accent">{scaleType.toUpperCase()} SCALE</span>
      </div>

      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-primary)" opacity={0.6} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
              stroke="var(--color-border-primary)"
            />
            <YAxis 
              scale={scaleType === 'log' ? 'log' : 'auto'}
              domain={scaleType === 'log' ? ['auto', 'auto'] : [90, 'auto']}
              tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
              stroke="var(--color-border-primary)"
              label={{ value: 'Indexed NAV', angle: -90, position: 'insideLeft', fill: 'var(--color-text-muted)', fontSize: 9 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-text-primary)'
              }}
              formatter={(value: any, name: any, props: any) => {
                const rawVal = props.payload[`raw${name.replace(' ', '')}`] || props.payload.rawNav;
                return [
                  <span>
                    {value}% <span className="text-text-muted text-[10px]">(${rawVal.toLocaleString(undefined, { minimumFractionDigits: 1 })})</span>
                  </span>,
                  name
                ];
              }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-sans)', marginTop: '5px' }}
            />
            <Area 
              type="monotone" 
              dataKey="Portfolio" 
              stroke="var(--color-accent)" 
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPortfolio)"
              activeDot={{ r: 6, fill: "var(--color-accent)", stroke: "#fff", strokeWidth: 2 }}
              filter="url(#glow)"
            />
            {showNifty && (
              <Line 
                type="monotone" 
                dataKey="Nifty 50" 
                stroke="var(--color-chart-2)" 
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 4"
              />
            )}
            {showSP && (
              <Line 
                type="monotone" 
                dataKey="S&P 500" 
                stroke="var(--color-chart-3)" 
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 4"
              />
            )}
            
            <Brush 
              dataKey="date" 
              height={15} 
              stroke="var(--color-border-secondary)" 
              fill="var(--color-bg-primary)"
              tickFormatter={() => ''}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default W02_PerformanceLine;
