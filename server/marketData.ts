const TICKERS = [
  { symbol: '^NSEI', name: 'Nifty 50', base: 23145.80 },
  { symbol: '^BSESN', name: 'Sensex', base: 76110.15 },
  { symbol: '^GSPC', name: 'S&P 500', base: 5304.72 },
  { symbol: '^FTSE', name: 'FTSE 100', base: 8312.45 },
  { symbol: 'USDINR=X', name: 'USD/INR', base: 83.425 },
  { symbol: 'EURUSD=X', name: 'EUR/USD', base: 1.0845 },
  { symbol: 'GC=F', name: 'Gold', base: 2342.60 },
  { symbol: 'CL=F', name: 'Crude Oil', base: 77.85 },
];

export function startMarketDataStream(callback: (data: any) => void, intervalMs: number = 250) {
  return setInterval(() => {
    // Generate High-Frequency updates for all tickers server-side
    const dataBatch = TICKERS.map(t => {
      const volatility = t.base * 0.0005; // 0.05% max swing per tick
      const change = (Math.random() * volatility * 2) - volatility;
      const newPrice = t.base + change;
      const totalChange = newPrice - t.base;
      
      return {
        symbol: t.symbol,
        name: t.name,
        price: newPrice,
        change: totalChange,
        changePercent: (totalChange / t.base) * 100,
        sparkline: Array.from({ length: 7 }, () => newPrice + (Math.random() * volatility - volatility/2))
      };
    });

    callback(dataBatch);
  }, intervalMs);
}
