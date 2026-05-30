import { describe, it, expect } from 'vitest';
import { 
  generateHoldings, 
  recalculateHoldings, 
  generateSummary,
  calculateDrawdowns
} from '../data/mockDataGenerator';

describe('Meridian Portfolio Analytics Formulas', () => {
  
  it('should correctly recalculate holdings weights and MV', () => {
    const holdings = generateHoldings();
    
    // Recalculate weights
    recalculateHoldings(holdings);
    
    // Sum of weights should equal 100% (within decimal rounding margin)
    const totalWeight = holdings.reduce((sum, h) => sum + h.weight, 0);
    expect(totalWeight).toBeGreaterThan(99.0);
    expect(totalWeight).toBeLessThan(101.0);
    
    // Price * Qty should equal Market Value
    holdings.forEach((h) => {
      expect(h.marketValue).toBe(h.price * h.quantity);
    });
  });

  it('should correctly calculate Parametric Value-at-Risk (VaR)', () => {
    const holdings = generateHoldings();
    recalculateHoldings(holdings);
    
    const summary = generateSummary(holdings);
    
    // VaR should be greater than 0
    expect(summary.dailyVaR).toBeGreaterThan(0);
    // VaR should be a reasonable proportion of AUM (typically 1-3%)
    const varRatio = summary.dailyVaR / summary.aum;
    expect(varRatio).toBeGreaterThan(0.01);
    expect(varRatio).toBeLessThan(0.05);
  });

  it('should correctly calculate drawdown curves', () => {
    const mockNav = [
      { date: '2026-01-01', nav: 100, nifty50: 18000, sp500: 4200 },
      { date: '2026-01-02', nav: 95, nifty50: 17500, sp500: 4100 }, // drop
      { date: '2026-01-03', nav: 105, nifty50: 18500, sp500: 4300 } // recovery & peak
    ];
    
    const drawdowns = calculateDrawdowns(mockNav);
    
    expect(drawdowns[0].drawdown).toBe(0); // first point is peak
    expect(drawdowns[1].drawdown).toBe(-5.0); // peak 100, dropped to 95 -> -5%
    expect(drawdowns[2].drawdown).toBe(0); // peak 105, new high -> 0%
  });
});
