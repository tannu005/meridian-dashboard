import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { WidgetComponentProps, BrinsonAttribution } from '../types';

export const W09_PerformanceAttribution: React.FC<WidgetComponentProps<any, BrinsonAttribution[]>> = ({
  data,
  config,
}) => {
  const displayUnit = config.attributionType || 'bps';

  const processedData = useMemo(() => {
    if (!data) return [];

    return data.map((d) => {
      const scale = displayUnit === 'percent' ? 0.01 : 1.0;
      return {
        sector: d.sector,
        Allocation: parseFloat((d.allocationEffect * scale).toFixed(displayUnit === 'percent' ? 3 : 1)),
        Selection: parseFloat((d.selectionEffect * scale).toFixed(displayUnit === 'percent' ? 3 : 1)),
        Interaction: parseFloat((d.interactionEffect * scale).toFixed(displayUnit === 'percent' ? 3 : 1)),
        Total: parseFloat((d.excessReturn * scale).toFixed(displayUnit === 'percent' ? 3 : 1))
      };
    });
  }, [data, displayUnit]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-text-muted">
        No performance attribution data available.
      </div>
    );
  }

  const formatYAxis = (value: number) => {
    return displayUnit === 'percent' ? `${value}%` : `${value} bps`;
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary text-text-primary">
      <div className="text-[10px] text-text-muted font-mono mb-2 uppercase flex items-center justify-between">
        <span>Brinson Attribution Analysis (Portfolio vs Benchmark)</span>
        <span className="text-accent">UNIT: {displayUnit.toUpperCase()}</span>
      </div>

      <div className="flex-1 min-h-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processedData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-primary)" opacity={0.6} />
            <XAxis 
              dataKey="sector" 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontFamily: 'var(--font-sans)' }}
              stroke="var(--color-border-primary)"
            />
            <YAxis 
              tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}
              stroke="var(--color-border-primary)"
              tickFormatter={formatYAxis}
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
              formatter={(value: any, name: any) => [
                <span>{value} {displayUnit === 'percent' ? '%' : 'bps'}</span>,
                name
              ]}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-sans)', marginTop: '5px' }}
            />
            {/* Allocation Effect */}
            <Bar dataKey="Allocation" fill="var(--color-chart-1)" radius={[2, 2, 0, 0]} />
            {/* Selection Effect */}
            <Bar dataKey="Selection" fill="var(--color-chart-2)" radius={[2, 2, 0, 0]} />
            {/* Interaction Effect */}
            <Bar dataKey="Interaction" fill="var(--color-chart-4)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default W09_PerformanceAttribution;
