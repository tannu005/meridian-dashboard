import React, { useMemo } from 'react';
import { WidgetComponentProps, PortfolioSummary } from '../types';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export const W07_VaRGauge: React.FC<WidgetComponentProps<any, PortfolioSummary>> = ({
  data,
  config,
}) => {
  const confidence = Number(config.confidence) || 0.99;
  const calculationType = config.type || 'parametric';
  const varLimit = Number(config.varLimit) || 65000000; // default $65M limit

  const { calculatedVaR, percentageOfLimit, riskZone } = useMemo(() => {
    if (!data) return { calculatedVaR: 0, percentageOfLimit: 0, riskZone: 'green' };

    // Standard daily VaR from generator is at 99% parametric
    // Adjust based on config parameters
    let multiplier = 1.0;
    if (confidence === 0.95) {
      multiplier = 1.645 / 2.326; // ratio of 95% to 99% z-scores
    }

    if (calculationType === 'historical') {
      // Historical VaR incorporates fat-tail deviations, typically 12% higher
      multiplier *= 1.12;
    }

    const calculatedVaR = data.dailyVaR * multiplier;
    const percentageOfLimit = (calculatedVaR / varLimit) * 100;

    let riskZone = 'green';
    if (percentageOfLimit >= 90) riskZone = 'red';
    else if (percentageOfLimit >= 70) riskZone = 'amber';

    return {
      calculatedVaR,
      percentageOfLimit,
      riskZone
    };
  }, [data, confidence, calculationType, varLimit]);

  // Compute SVG arc angles
  const arcParameters = useMemo(() => {
    // We draw a semi-circle gauge from 225 deg to 45 deg (180 deg span)
    const angleSpan = 180;
    const cappedPercent = Math.min(100, Math.max(0, percentageOfLimit));
    const needleRotation = -90 + (cappedPercent / 100) * angleSpan; // -90 is left, 0 is top, +90 is right

    return {
      needleRotation
    };
  }, [percentageOfLimit]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-text-muted">
        No risk summary data available.
      </div>
    );
  }

  const getRiskColor = (zone: string) => {
    if (zone === 'red') return 'var(--color-danger)';
    if (zone === 'amber') return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const currentRiskColor = getRiskColor(riskZone);

  return (
    <div className="flex flex-col h-full bg-bg-secondary text-text-primary items-center justify-center p-1">
      {/* Risk Meta tags */}
      <div className="flex items-center justify-between w-full mb-3 flex-shrink-0 text-[10px] font-mono text-text-muted">
        <span>MODEL: {calculationType.toUpperCase()} ({confidence * 100}%)</span>
        <span>LIMIT: ${(varLimit/1000000).toFixed(0)}M</span>
      </div>

      {/* Speedometer Gauge Canvas */}
      <div className="relative w-40 h-24 flex items-center justify-center">
        <svg width="150" height="90" className="overflow-visible">
          {/* Background Grey track */}
          <path
            d="M 15,80 A 60,60 0 0,1 135,80"
            fill="none"
            stroke="var(--color-border-primary)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          
          {/* Green Zone arc (0-70%) */}
          <path
            d="M 15,80 A 60,60 0 0,1 100,30"
            fill="none"
            stroke="var(--color-success)"
            strokeWidth="10"
            opacity={0.35}
          />
          
          {/* Amber Zone arc (70-90%) */}
          <path
            d="M 100,30 A 60,60 0 0,1 123,50"
            fill="none"
            stroke="var(--color-warning)"
            strokeWidth="10"
            opacity={0.35}
          />
          
          {/* Red Zone arc (90-100%) */}
          <path
            d="M 123,50 A 60,60 0 0,1 135,80"
            fill="none"
            stroke="var(--color-danger)"
            strokeWidth="10"
            strokeLinecap="round"
            opacity={0.35}
          />
          
          {/* Colored Active Risk Fill path */}
          <path
            d={`M 15,80 A 60,60 0 0,1 ${15 + (Math.min(100, percentageOfLimit) / 100) * 120},${80 - Math.sin((Math.min(100, percentageOfLimit) / 100) * Math.PI) * 60}`}
            fill="none"
            stroke={currentRiskColor}
            strokeWidth="10"
            strokeLinecap="round"
            opacity={0.1} // subtle glow behind needle
          />

          {/* Needle Base Pin */}
          <circle cx="75" cy="80" r="5" fill="var(--color-text-primary)" />
          
          {/* Dial Needle Pin */}
          <line
            x1="75"
            y1="80"
            x2="75"
            y2="30"
            stroke={currentRiskColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{
              transform: `rotate(${arcParameters.needleRotation}deg)`,
              transformOrigin: '75px 80px',
              transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </svg>

        {/* Absolute Value overlay */}
        <div className="absolute bottom-0 text-center">
          <span className="text-xs font-mono font-bold text-text-primary">
            ${calculatedVaR.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[9px] font-sans text-text-muted block font-medium">
            Daily Expected Max Loss
          </span>
        </div>
      </div>

      {/* Safety Compliance Statement */}
      <div className={`
        flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded border text-[9px] font-semibold uppercase tracking-wider font-mono flex-shrink-0
        ${riskZone === 'red' ? 'border-status-danger/30 bg-status-danger/10 text-status-danger' : ''}
        ${riskZone === 'amber' ? 'border-status-warning/30 bg-status-warning/10 text-status-warning' : ''}
        ${riskZone === 'green' ? 'border-status-success/30 bg-status-success/10 text-status-success' : ''}
      `}>
        {riskZone === 'red' ? (
          <>
            <ShieldAlert className="w-3.5 h-3.5" /> LIMIT BREACHED ({percentageOfLimit.toFixed(1)}%)
          </>
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5" /> RISK COMPLIANT ({percentageOfLimit.toFixed(1)}%)
          </>
        )}
      </div>
    </div>
  );
};
export default W07_VaRGauge;
