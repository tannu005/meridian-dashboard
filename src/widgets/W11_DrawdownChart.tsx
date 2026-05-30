import React, { useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { WidgetComponentProps, DrawdownDataPoint } from '../types';

export const W11_DrawdownChart: React.FC<WidgetComponentProps<any, DrawdownDataPoint[]>> = ({
  data,
  config,
}) => {
  const lookbackDays = Number(config.lookbackDays) || 252;

  const processedData = useMemo(() => {
    if (!data) return [];
    return data.slice(-lookbackDays);
  }, [data, lookbackDays]);

  // Find worst drawdown point
  const maxDrawdown = useMemo(() => {
    if (processedData.length === 0) return 0;
    return Math.min(...processedData.map(pt => pt.drawdown));
  }, [processedData]);

  if (!data || data.length === 0 || processedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-text-muted">
        No drawdown history available.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-secondary text-text-primary">
      <div className="text-[10px] text-text-muted font-mono mb-2 uppercase flex items-center justify-between">
        <span>Peak-to-Trough Drawdown Analysis ({lookbackDays}d window)</span>
        <span className="text-status-danger font-bold">MAX DRAWDOWN: {maxDrawdown.toFixed(2)}%</span>
      </div>

      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-primary)" opacity={0.6} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
              stroke="var(--color-border-primary)"
            />
            <YAxis 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
              stroke="var(--color-border-primary)"
              tickFormatter={(value) => `${value}%`}
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
              formatter={(value: any) => [`${value}%`, 'Drawdown']}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-sans)', marginTop: '5px' }}
            />
            {/* Max Drawdown Reference Line */}
            <ReferenceLine 
              y={maxDrawdown} 
              stroke="var(--color-danger)" 
              strokeDasharray="3 3"
              label={{ value: `MAX: ${maxDrawdown.toFixed(1)}%`, fill: 'var(--color-danger)', fontSize: 8, position: 'bottom' }} 
            />
            
            {/* Portfolio Drawdown Area */}
            <Area 
              type="monotone" 
              dataKey="drawdown" 
              name="Portfolio" 
              stroke="var(--color-danger)" 
              fill="rgba(239, 68, 68, 0.15)" 
              strokeWidth={1.5}
            />
            {/* Benchmark index Drawdown Area */}
            <Area 
              type="monotone" 
              dataKey="nifty50Drawdown" 
              name="Nifty 50" 
              stroke="var(--color-chart-2)" 
              fill="none" 
              strokeWidth={1.2}
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default W11_DrawdownChart;
