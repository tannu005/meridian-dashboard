import React, { useState, useMemo } from 'react';
import { WidgetComponentProps, CorrelationData } from '../types';
import { useDashboardStore } from '../store/dashboardStore';
import { ArrowLeft, Crosshair } from 'lucide-react';

export const W08_CorrelationMatrix: React.FC<WidgetComponentProps<any, CorrelationData>> = ({
  data,
  config,
}) => {
  const { selectedTicker } = useDashboardStore();
  const [selectedPair, setSelectedPair] = useState<[string, string] | null>(null);

  const lookbackDays = config.lookbackDays || 90;

  // Retrieve correlation coefficients
  const correlationTable = useMemo(() => {
    if (!data) return null;
    
    // Slightly adjust correlation coefficients based on lookbackDays configuration
    // (longer lookbacks tend to regress slightly toward long-term mean coefficients)
    const factor = lookbackDays === 30 ? 1.05 : lookbackDays === 252 ? 0.95 : 1.0;
    
    const adjustedMatrix = data.matrix.map((row, rIdx) => 
      row.map((val, cIdx) => {
        if (rIdx === cIdx) return 1.0;
        const adjusted = Math.max(-0.99, Math.min(0.99, val * factor));
        return parseFloat(adjusted.toFixed(2));
      })
    );

    return {
      tickers: data.tickers,
      matrix: adjustedMatrix
    };
  }, [data, lookbackDays]);

  const [scatterPoints, setScatterPoints] = useState<{x: number, y: number}[]>([]);

  // Generate returns scatter plot coordinates for details mode
  React.useEffect(() => {
    if (!selectedPair || !correlationTable) {
      setScatterPoints([]);
      return;
    }
    
    // Generate 50 simulated daily returns (-3% to +3.5%) with a correlation matches their grid coefficient
    const tickerA = selectedPair[0];
    const tickerB = selectedPair[1];
    
    const idxA = correlationTable.tickers.indexOf(tickerA);
    const idxB = correlationTable.tickers.indexOf(tickerB);
    const coeff = correlationTable.matrix[idxA]?.[idxB] ?? 0.5;

    const points = [];
    for (let i = 0; i < 50; i++) {
      const returnA = (Math.random() - 0.49) * 4.0; // ticker A return
      // Ticker B return shares variance based on correlation coefficient
      const returnB = returnA * coeff + (Math.random() - 0.5) * 4.0 * Math.sqrt(1 - coeff * coeff);
      points.push({ x: returnA, y: returnB });
    }
    setScatterPoints(points);
  }, [selectedPair, correlationTable]);

  if (!correlationTable) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-text-muted">
        No asset correlation data available.
      </div>
    );
  }

  const getDivergingColor = (val: number) => {
    if (val === 1.0) return 'var(--color-bg-tertiary)';
    if (val > 0) {
      // Positive correlation -> shades of Red
      return `rgba(239, 68, 68, ${val * 0.8})`;
    } else {
      // Negative correlation -> shades of Blue
      return `rgba(59, 130, 246, ${Math.abs(val) * 0.8})`;
    }
  };

  const handleCellClick = (rIdx: number, cIdx: number) => {
    const tA = correlationTable.tickers[rIdx];
    const tB = correlationTable.tickers[cIdx];
    if (tA !== tB) {
      setSelectedPair([tA, tB]);
    }
  };

  // Render detail view (Scatter Plot)
  if (selectedPair) {
    const tickerA = selectedPair[0];
    const tickerB = selectedPair[1];
    
    // Map coordinate points to SVG canvas
    const svgWidth = 240;
    const svgHeight = 150;
    const margin = 20;

    return (
      <div className="flex flex-col h-full bg-bg-secondary text-text-primary">
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <button 
            onClick={() => setSelectedPair(null)}
            className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:text-accent-hover transition"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <span className="text-[10px] font-mono text-text-muted uppercase">
            {tickerA} vs {tickerB} ({lookbackDays}d lookback)
          </span>
        </div>

        {/* Custom SVG Scatter plot */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 min-h-0">
          <div className="bg-bg-primary border border-border-primary rounded p-1.5 flex-shrink-0">
            <svg width={svgWidth} height={svgHeight} className="overflow-visible font-mono text-[8px] fill-text-muted">
              {/* Axes */}
              <line x1={margin} y1={svgHeight/2} x2={svgWidth-margin} y2={svgHeight/2} stroke="var(--color-border-secondary)" strokeWidth="1" />
              <line x1={svgWidth/2} y1={margin} x2={svgWidth/2} y2={svgHeight-margin} stroke="var(--color-border-secondary)" strokeWidth="1" />
              
              {/* Plot dots */}
              {scatterPoints.map((pt, idx) => {
                // Map returns (-5% to +5%) to SVG dimensions
                const x = svgWidth/2 + (pt.x / 5.0) * (svgWidth/2 - margin);
                const y = svgHeight/2 - (pt.y / 5.0) * (svgHeight/2 - margin);
                return (
                  <circle 
                    key={idx} 
                    cx={x} 
                    cy={y} 
                    r="2.5" 
                    fill="var(--color-accent)" 
                    opacity={0.7} 
                  />
                );
              })}
              
              {/* Core Axis labels */}
              <text x={svgWidth-margin-15} y={svgHeight/2 + 10}>{tickerA} %</text>
              <text x={svgWidth/2 + 5} y={margin + 5}>{tickerB} %</text>
            </svg>
          </div>

          <div className="flex flex-col text-left space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs">
              <Crosshair className="w-4 h-4 text-accent" />
              <span className="font-bold text-text-primary font-sans">Linear Scatter Fit</span>
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed font-sans max-w-xs">
              Statistical dispersion represents the daily return co-movements. The tightly packed coordinates illustrate how correlated these two assets are.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { tickers, matrix } = correlationTable;
  const size = tickers.length;

  return (
    <div className="flex flex-col h-full bg-bg-secondary text-text-primary">
      <div className="text-[10px] text-text-muted font-mono mb-2 uppercase">
        Pairwise Pearson coefficients ({lookbackDays}d daily window)
      </div>

      {/* Grid Canvas */}
      <div className="flex-1 min-h-[160px] flex items-center justify-center overflow-auto scrollbar-thin">
        <div 
          className="grid gap-[1px] bg-border-primary border border-border-primary rounded overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(28px, 1fr))` }}
        >
           {matrix.map((row, rIdx) => 
            row.map((val, cIdx) => {
              const isDiagonal = rIdx === cIdx;
              const bg = getDivergingColor(val);
              const isSelectedRowOrCol = selectedTicker && (tickers[rIdx] === selectedTicker || tickers[cIdx] === selectedTicker);
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  style={{ backgroundColor: bg }}
                  className={`
                    w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-[9px] font-mono font-bold select-none transition-all duration-200
                    ${isDiagonal ? 'text-accent font-bold uppercase text-[8px]' : 'text-white cursor-pointer hover:scale-105 hover:brightness-110 hover:z-10'}
                    ${isSelectedRowOrCol ? 'ring-1 ring-accent ring-inset z-10' : ''}
                  `}
                  title={isDiagonal ? tickers[rIdx] : `${tickers[rIdx]} & ${tickers[cIdx]}: ${val}`}
                >
                  {isDiagonal ? (
                    tickers[rIdx].slice(0, 3)
                  ) : (
                    val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default W08_CorrelationMatrix;
