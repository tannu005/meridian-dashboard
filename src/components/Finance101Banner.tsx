import React, { useState } from 'react';
import { BookOpen, Info, ArrowRight } from 'lucide-react';

export const Finance101Banner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'AUM' | 'NAV' | 'VaR' | 'Sharpe' | 'Attribution'>('AUM');

  const getExplanation = () => {
    switch (activeTab) {
      case 'AUM':
        return {
          title: "AUM (Assets Under Management)",
          analogy: "Think of this as the size of our absolute vault. It's the total cash value of all the investments we hold for our clients.",
          jargon: "The market value of all investments managed by the firm on behalf of clients.",
          value: "$45,000,000,000 (USD 45 Billion)"
        };
      case 'NAV':
        return {
          title: "NAV (Net Asset Value)",
          analogy: "Like a single ticket price to a theme park, or a stock price. When our underlying holdings go up in value, the share price (NAV) climbs higher!",
          jargon: "The net value of an entity's assets minus the value of its liabilities, divided by the number of shares outstanding.",
          value: "$124.65 per Share"
        };
      case 'VaR':
        return {
          title: "Value at Risk (VaR)",
          analogy: "A mathematical 'worst-case scenario' safety check. It tells our risk team: 'On a really bad day, we shouldn't lose more than this amount.' We keep this low to protect investor capital.",
          jargon: "A statistical metric measuring the maximum potential loss over a target horizon at a given confidence interval.",
          value: "$50,000,000 Max Daily Loss Limit"
        };
      case 'Sharpe':
        return {
          title: "Sharpe Ratio",
          analogy: "A performance report card. It measures if our profits were worth the risks we took. Scores above 1.0 are good, and scores above 2.0 are phenomenal!",
          jargon: "A measure of risk-adjusted return, calculated by subtracting the risk-free rate from the portfolio return and dividing by the standard deviation.",
          value: "1.85 (Strong Risk-Adjusted Return)"
        };
      case 'Attribution':
        return {
          title: "Performance Attribution (Brinson Model)",
          analogy: "Explains *how* we beat the market. Did we perform well because we selected great sectors (Allocation Effect) or did we pick outstanding individual stocks (Selection Effect)?",
          jargon: "A quantitative technique to explain excess return by decomposing performance into allocation, selection, and interaction effects.",
          value: "+32.8 bps Outperformance (Financials)"
        };
    }
  };

  const exp = getExplanation();

  return (
    <div className="mx-4 md:mx-6 my-2 bg-gradient-to-r from-accent/15 via-indigo-500/5 to-bg-secondary border border-accent/30 rounded-lg p-4 shadow-glow relative overflow-hidden animate-fade-in">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-accent" />
        <span className="text-xs font-extrabold uppercase tracking-widest text-text-primary font-sans">
          🎓 FINANCE 101: Interactive Beginner Guide
        </span>
        <span className="text-[10px] text-text-muted font-sans font-medium">
          (We've translated institutional terminology into simple English below. Click a tab to learn!)
        </span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-3.5 border-b border-border-primary/50 pb-2">
        {(['AUM', 'NAV', 'VaR', 'Sharpe', 'Attribution'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-2.5 py-1 rounded font-sans text-[10px] font-bold uppercase transition
              ${activeTab === tab 
                ? 'bg-accent text-bg-primary shadow-sm font-extrabold' 
                : 'bg-bg-tertiary border border-border-primary text-text-secondary hover:bg-bg-primary hover:text-text-primary'}
            `}
          >
            {tab === 'Sharpe' ? 'Sharpe Ratio' : tab === 'Attribution' ? 'Attribution' : tab}
          </button>
        ))}
      </div>

      {/* Explanation Area */}
      <div className="grid md:grid-cols-3 gap-4 text-xs font-sans animate-fade-in">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-accent">{exp.title}</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-bg-tertiary border border-border-primary font-mono text-text-muted font-bold">
              CURRENT VALUE: {exp.value}
            </span>
          </div>
          <p className="text-[11px] text-text-primary leading-relaxed">
            💡 <strong className="text-accent/90">Plain English:</strong> {exp.analogy}
          </p>
        </div>
        <div className="p-2.5 rounded bg-bg-primary border border-border-primary text-[9px] text-text-muted flex flex-col justify-between font-mono">
          <div>
            <div className="flex items-center gap-1 mb-1 text-text-secondary font-bold font-sans">
              <Info className="w-3.5 h-3.5 text-accent" />
              <span>INSTITUTIONAL DEFINITION:</span>
            </div>
            <p className="leading-relaxed select-text">{exp.jargon}</p>
          </div>
          <div className="text-[8px] text-accent font-bold mt-2 font-sans uppercase tracking-wider flex items-center gap-0.5">
            Bloomberg Mode <ArrowRight className="w-2.5 h-2.5" /> Normal Density
          </div>
        </div>
      </div>
    </div>
  );
};
export default Finance101Banner;
