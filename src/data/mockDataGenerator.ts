import { 
  PortfolioSummary, 
  MockHolding, 
  NavDataPoint, 
  NewsArticle, 
  AlertNotification, 
  CorrelationData, 
  BrinsonAttribution,
  DrawdownDataPoint,
  ExposureDataPoint
} from '../types';

// Hardcoded tickers for Indian & global context
const TICKERS = ['HDFCBANK', 'TCS', 'RELIANCE', 'INFY', 'ICICIBANK', 'BHARTIAIRTEL', 'ITC', 'SBIN', 'LT', 'KOTAKBANK'];

// Generate initial NAV series
export const generateNAVHistory = (days = 252): NavDataPoint[] => {
  const history: NavDataPoint[] = [];
  let nav = 100.0;
  let nifty = 18000.0;
  let sp500 = 4200.0;
  
  const start = new Date();
  start.setDate(start.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    
    // Simulate daily changes (typically -2% to +2.5%)
    // Include a significant market shock around day 120 (COVID-style drop)
    let shockMultiplier = 1.0;
    if (i >= 110 && i <= 130) {
      shockMultiplier = -1.8; // severe downward trend
    } else if (i > 130 && i <= 160) {
      shockMultiplier = 1.4; // recovery bounce
    }
    
    const navChange = (Math.random() - 0.48) * 2.0 * shockMultiplier; // slight positive drift
    const niftyChange = (Math.random() - 0.49) * 2.2 * shockMultiplier;
    const spChange = (Math.random() - 0.47) * 1.8 * shockMultiplier;
    
    nav = Math.max(10, nav * (1 + navChange / 100));
    nifty = Math.max(1000, nifty * (1 + niftyChange / 100));
    sp500 = Math.max(500, sp500 * (1 + spChange / 100));
    
    history.push({
      date: currentDate.toISOString().split('T')[0],
      nav: parseFloat(nav.toFixed(2)),
      nifty50: parseFloat(nifty.toFixed(2)),
      sp500: parseFloat(sp500.toFixed(2))
    });
  }
  return history;
};

// Generate Drawdown curves
export const calculateDrawdowns = (navHistory: NavDataPoint[]): DrawdownDataPoint[] => {
  let maxNav = -1;
  let maxNifty = -1;
  
  return navHistory.map((pt) => {
    if (pt.nav > maxNav) maxNav = pt.nav;
    if (pt.nifty50 > maxNifty) maxNifty = pt.nifty50;
    
    const drawdown = ((pt.nav - maxNav) / maxNav) * 100;
    const niftyDrawdown = ((pt.nifty50 - maxNifty) / maxNifty) * 100;
    
    return {
      date: pt.date,
      portfolio: pt.nav,
      drawdown: parseFloat(drawdown.toFixed(2)),
      nifty50Drawdown: parseFloat(niftyDrawdown.toFixed(2))
    };
  });
};

// Generate initial holdings
export const generateHoldings = (): MockHolding[] => {
  const holdings: MockHolding[] = [
    { ticker: 'HDFCBANK', name: 'HDFC Bank Ltd', quantity: 1200000, price: 1650.45, costBasis: 1520.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Financials', assetClass: 'Equity' },
    { ticker: 'TCS', name: 'Tata Consultancy Services', quantity: 450000, price: 3850.20, costBasis: 3600.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Technology', assetClass: 'Equity' },
    { ticker: 'RELIANCE', name: 'Reliance Industries Ltd', quantity: 980000, price: 2870.90, costBasis: 2450.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Energy', assetClass: 'Equity' },
    { ticker: 'INFY', name: 'Infosys Ltd', quantity: 800000, price: 1520.15, costBasis: 1610.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Technology', assetClass: 'Equity' },
    { ticker: 'ICICIBANK', name: 'ICICI Bank Ltd', quantity: 1500000, price: 1120.30, costBasis: 980.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Financials', assetClass: 'Equity' },
    { ticker: 'BHARTIAIRTEL', name: 'Bharti Airtel Ltd', quantity: 700000, price: 1280.60, costBasis: 1100.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Technology', assetClass: 'Equity' },
    { ticker: 'ITC', name: 'ITC Ltd', quantity: 2200000, price: 430.25, costBasis: 390.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Consumer Staples', assetClass: 'Equity' },
    { ticker: 'SBIN', name: 'State Bank of India', quantity: 1100000, price: 810.45, costBasis: 720.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Financials', assetClass: 'Equity' },
    { ticker: 'LT', name: 'Larsen & Toubro Ltd', quantity: 300000, price: 3450.80, costBasis: 3100.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Energy', assetClass: 'Equity' },
    { ticker: 'KOTAKBANK', name: 'Kotak Mahindra Bank', quantity: 500000, price: 1720.50, costBasis: 1850.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Financials', assetClass: 'Equity' },
    
    // Fixed Income
    { ticker: 'GSEC_718_2033', name: 'GOI Sovereign Bond 7.18% 2033', quantity: 350000, price: 101.25, costBasis: 100.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Healthcare', assetClass: 'Fixed Income' },
    { ticker: 'NABARD_815', name: 'NABARD Tax-Free Bond 8.15%', quantity: 150000, price: 104.50, costBasis: 102.5, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Financials', assetClass: 'Fixed Income' },
    
    // Derivatives (Options & Futures)
    { ticker: 'NIFTY_JUN_23000_CE', name: 'Nifty Jun 23000 Call Option', quantity: 8000, price: 185.30, costBasis: 120.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Derivatives', assetClass: 'Derivative' },
    { ticker: 'RELIANCE_JUN_2900_PE', name: 'Reliance Jun 2900 Put Option', quantity: 5000, price: 42.60, costBasis: 55.0, marketValue: 0, dailyPnL: 0, dailyPnLPercent: 0, weight: 0, sector: 'Derivatives', assetClass: 'Derivative' },
  ];
  
  recalculateHoldings(holdings);
  return holdings;
};

// Update price and recalculate P&Ls and Weights
export const recalculateHoldings = (holdings: MockHolding[]): void => {
  let totalMarketValue = 0;
  
  holdings.forEach((h) => {
    h.marketValue = h.quantity * h.price;
    totalMarketValue += h.marketValue;
  });
  
  holdings.forEach((h) => {
    h.weight = parseFloat(((h.marketValue / totalMarketValue) * 100).toFixed(2));
    
    // Compute daily PnL (simulate random daily change if not already set)
    if (h.dailyPnLPercent === 0) {
      h.dailyPnLPercent = parseFloat(((Math.random() - 0.49) * 2.5).toFixed(2));
    }
    
    h.dailyPnL = parseFloat((h.marketValue * (h.dailyPnLPercent / 100)).toFixed(2));
  });
};

// Generate summary metrics
export const generateSummary = (holdings: MockHolding[]): PortfolioSummary => {
  let totalMV = 0;
  let totalPnL = 0;
  let totalCost = 0;
  
  holdings.forEach((h) => {
    totalMV += h.marketValue;
    totalCost += h.quantity * h.costBasis;
    totalPnL += h.dailyPnL;
  });
  
  const dailyChangePercent = (totalPnL / totalMV) * 100;
  const maxDrawdown = 18.45; // static or derived from nav history
  
  // Calculate Value at Risk
  // Parametric daily VaR approximation: 99% VaR = 2.326 * portfolio_std_dev
  const stdDev = 0.012; // 1.2% daily return volatility
  const var99 = totalMV * 2.326 * stdDev;
  
  return {
    aum: totalMV,
    aumChange24h: totalPnL,
    aumChangePercent24h: parseFloat(dailyChangePercent.toFixed(2)),
    nav: 124.65,
    navChange24h: parseFloat((dailyChangePercent * 1.25).toFixed(2)),
    navChangePercent24h: parseFloat(dailyChangePercent.toFixed(2)),
    sharpeRatio: 1.85,
    maxDrawdown,
    dailyVaR: var99,
    dailyVaRConfidence: 99
  };
};

// Generate correlation matrix
export const generateCorrelationMatrix = (): CorrelationData => {
  const size = TICKERS.length;
  const matrix: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
      } else {
        // High correlation between tech stocks, etc.
        let base = 0.3 + Math.random() * 0.4;
        if ((TICKERS[i] === 'TCS' && TICKERS[j] === 'INFY') || (TICKERS[i] === 'INFY' && TICKERS[j] === 'TCS')) {
          base = 0.85; // high correlation
        }
        if ((TICKERS[i] === 'HDFCBANK' && TICKERS[j] === 'ICICIBANK') || (TICKERS[i] === 'ICICIBANK' && TICKERS[j] === 'HDFCBANK')) {
          base = 0.78;
        }
        matrix[i][j] = parseFloat(base.toFixed(2));
      }
    }
  }
  
  return {
    tickers: TICKERS,
    matrix
  };
};

// Generate Brinson attribution data
export const generateBrinsonAttribution = (): BrinsonAttribution[] => {
  return [
    { sector: 'Financials', allocationEffect: 12.5, selectionEffect: 18.2, interactionEffect: 2.1, excessReturn: 32.8 },
    { sector: 'Technology', allocationEffect: -22.4, selectionEffect: -14.5, interactionEffect: -4.2, excessReturn: -41.1 }, // Major drag due to semiconductor crash
    { sector: 'Healthcare', allocationEffect: 4.2, selectionEffect: -5.1, interactionEffect: 0.5, excessReturn: -0.4 },
    { sector: 'Energy', allocationEffect: 15.6, selectionEffect: 12.0, interactionEffect: 4.8, excessReturn: 32.4 },
    { sector: 'Consumer Staples', allocationEffect: -2.1, selectionEffect: 6.8, interactionEffect: -0.4, excessReturn: 4.3 },
  ];
};

// Generate Exposure hierarchy
export const generateExposureTreemap = (): ExposureDataPoint[] => {
  return [
    // Level 1: Geography -> Level 2: Asset -> Level 3: Sector
    { name: 'India.Equities.Financials', path: 'India/Equities/Financials', value: 450000000, pnlPercent: 1.45 },
    { name: 'India.Equities.Technology', path: 'India/Equities/Technology', value: 380000000, pnlPercent: -0.85 },
    { name: 'India.Equities.Energy', path: 'India/Equities/Energy', value: 290000000, pnlPercent: 2.15 },
    { name: 'India.Equities.Consumer', path: 'India/Equities/Consumer', value: 180000000, pnlPercent: 0.50 },
    { name: 'India.FixedIncome.Sovereign', path: 'India/Fixed Income/Sovereign', value: 150000000, pnlPercent: 0.12 },
    
    { name: 'US.Equities.Technology', path: 'US/Equities/Technology', value: 280000000, pnlPercent: -1.20 },
    { name: 'US.Equities.Financials', path: 'US/Equities/Financials', value: 120000000, pnlPercent: 0.85 },
    { name: 'US.Derivatives.Indices', path: 'US/Derivatives/Indices', value: 95000000, pnlPercent: 4.80 },
    
    { name: 'Europe.Equities.Healthcare', path: 'Europe/Equities/Healthcare', value: 160000000, pnlPercent: 0.65 },
    { name: 'Europe.FixedIncome.Corporate', path: 'Europe/Fixed Income/Corporate', value: 85000000, pnlPercent: -0.05 },
  ];
};

// Generate News feed
export const generateNewsArticles = (): NewsArticle[] => {
  return [
    {
      id: 'news-1',
      title: 'Global Semiconductor Shortage Escalates: Tech Sector Plunges 8% in Morning Trade',
      summary: 'Major chip manufacturers halt production lines citing critical material shortages. The cascading effect has wiped $40B from tech valuations today, severely impacting the broader Nifty 50 and S&P 500 tech cohorts.',
      source: 'Bloomberg',
      timestamp: new Date().toISOString(),
      sentiment: 'negative',
      keywords: ['Semiconductors', 'Tech Crash', 'Shortage']
    },
    {
      id: 'news-2',
      title: 'SEBI mandates enhanced risk disclosures for portfolio managers managing alternative products.',
      summary: 'Under the new framework, portfolio managers managing alternatives must deploy daily VaR gauges and historical drawdown tracking models starting next quarter to enhance retail transparency.',
      source: 'Reuters',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      sentiment: 'neutral',
      keywords: ['SEBI', 'Risk Management', 'Portfolio Managers']
    },
    {
      id: 'news-3',
      title: 'Reliance Industries hits fresh 52-week high, anchoring Energy sector performance.',
      summary: 'While tech falters, Reliance shares jumped 3.2% today, acting as a defensive anchor for index funds. Financial analysts estimate the spin-off could unlock USD 12 billion in shareholder equity.',
      source: 'Economic Times',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      sentiment: 'positive',
      keywords: ['Reliance', 'Energy', 'Spin-off']
    },
    {
      id: 'news-4',
      title: 'TCS and Infosys issue profit warnings amidst hardware supply chain disruptions.',
      summary: 'IT service giants flagged margin compression for Q3 as hardware dependency bottlenecks project deliveries. Analysts are downgrading the entire IT pack.',
      source: 'Moneycontrol',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      sentiment: 'negative',
      keywords: ['TCS', 'Infosys', 'Supply Chain']
    }
  ];
};

// Generate Alerts
export const generateAlerts = (): AlertNotification[] => {
  return [
    { id: 'alert-1', message: 'CRITICAL RISK: Technology Sector Allocation Effect exceeds -20 bps threshold.', severity: 'critical', timestamp: new Date().toISOString(), category: 'risk' },
    { id: 'alert-2', message: 'PRICE EXPOSURE: INFY & TCS holdings declined > 5% in early trade.', severity: 'warning', timestamp: new Date(Date.now() - 600000).toISOString(), category: 'price' },
    { id: 'alert-3', message: 'PORTFOLIO REBALANCING: Suggested rotation from Tech to Energy due to active VaR limit breach.', severity: 'info', timestamp: new Date(Date.now() - 1200000).toISOString(), category: 'system' }
  ];
};
