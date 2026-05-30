import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WidgetComponentProps, MockHolding } from '../types';
import { useDashboardStore } from '../store/dashboardStore';
import { gsap } from 'gsap';
import { 
  ArrowUpDown, 
  Download, 
  Search, 
  SlidersHorizontal 
} from 'lucide-react';

export const W04_HoldingsTable: React.FC<WidgetComponentProps<any, MockHolding[]>> = ({
  data,
  config,
}) => {
  const { selectedTicker, setSelectedTicker } = useDashboardStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSector, setSelectedSector] = useState('all');
  const [pnlFilter, setPnlFilter] = useState('all'); // 'all', 'gains', 'losses'
  const [sortField, setSortField] = useState<keyof MockHolding>('marketValue');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumnConfig, setShowColumnConfig] = useState(false);

  const assetClassFilter = config.assetClass || 'all';
  const rowsPerPage = Number(config.rowsPerPage) || 10;

  // Track previous prices inside a mutable ref to trigger flashes on updates
  const prevPricesRef = useRef<Record<string, number>>({});

  // Fixed widths mapping to keep column layout absolutely consistent and prevent layout shifts
  const COLUMN_WIDTHS: Record<string, string> = {
    ticker: '90px',
    name: '180px',
    quantity: '90px',
    price: '100px',
    marketValue: '120px',
    dailyPnL: '120px',
    dailyPnLPercent: '95px',
    weight: '80px',
    sector: '140px',
    assetClass: '110px',
  };

  // Autocomplete search suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm || !data) return [];
    const term = searchTerm.toLowerCase();
    return data.filter(h => 
      h.ticker.toLowerCase().includes(term) || 
      h.name.toLowerCase().includes(term)
    ).slice(0, 5);
  }, [searchTerm, data]);

  // Track dynamic column visibility
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    ticker: true,
    name: true,
    quantity: true,
    price: true,
    marketValue: true,
    dailyPnL: true,
    dailyPnLPercent: true,
    weight: true,
    sector: true,
    assetClass: false, // hidden by default to fit density
  });

  const handleSort = (field: keyof MockHolding) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Extract unique sectors
  const sectorsList = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((h) => h.sector))).sort();
  }, [data]);

  // Filter & Sort Pipeline
  const processedData = useMemo(() => {
    if (!data) return [];
    
    return data
      .filter((h) => {
        // Asset class filter
        if (assetClassFilter !== 'all' && h.assetClass !== assetClassFilter) {
          return false;
        }
        // Sector filter
        if (selectedSector !== 'all' && h.sector !== selectedSector) {
          return false;
        }
        // P&L Filter
        if (pnlFilter === 'gains' && h.dailyPnL < 0) return false;
        if (pnlFilter === 'losses' && h.dailyPnL >= 0) return false;

        // Text Search filter (ticker, name, sector)
        const match = searchTerm.toLowerCase();
        return (
          h.ticker.toLowerCase().includes(match) ||
          h.name.toLowerCase().includes(match) ||
          h.sector.toLowerCase().includes(match)
        );
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        
        // Numbers sorting
        return sortAsc 
          ? (valA as number) - (valB as number) 
          : (valB as number) - (valA as number);
      });
  }, [data, assetClassFilter, selectedSector, pnlFilter, searchTerm, sortField, sortAsc]);

  // Pagination bounds
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, currentPage, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / rowsPerPage));

  // Trigger GSAP stagger row entrance animation when page, filters, or sorting changes
  useEffect(() => {
    if (paginatedData.length > 0) {
      gsap.killTweensOf('.holdings-row');
      gsap.fromTo('.holdings-row',
        { opacity: 0, x: -8 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.35, 
          stagger: 0.03, 
          ease: 'power2.out',
          clearProps: 'all' // clear inline styles so CSS transitions work perfectly
        }
      );
    }
  }, [currentPage, selectedSector, pnlFilter, sortField, sortAsc]);

  // Export filtered data as a CSV download
  const exportToCSV = () => {
    if (processedData.length === 0) return;
    
    const headers = ['Ticker', 'Name', 'Quantity', 'Price', 'Market Value', 'Daily P&L', 'P&L %', 'Weight', 'Sector', 'Asset Class'];
    const rows = processedData.map(h => [
      h.ticker,
      h.name,
      h.quantity,
      h.price,
      h.marketValue,
      h.dailyPnL,
      h.dailyPnLPercent,
      h.weight,
      h.sector,
      h.assetClass
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `meridian_holdings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-text-muted">
        No holdings details available.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-secondary text-text-primary">
      {/* Filtering Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search holdings..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="pl-8 pr-2 py-1 bg-bg-primary border border-border-primary rounded text-xs text-text-primary focus:outline-none focus:border-accent w-36 font-sans focus:ring-1 focus:ring-accent"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 mt-1 w-48 bg-bg-tertiary border border-border-primary rounded shadow-panel z-50 p-1.5 text-[10px] divide-y divide-border-primary/30 max-h-40 overflow-y-auto scrollbar-thin">
                {suggestions.map(s => (
                  <div
                    key={s.ticker}
                    onMouseDown={() => { setSearchTerm(s.ticker); setShowSuggestions(false); }}
                    className="p-1.5 cursor-pointer hover:bg-bg-primary transition text-text-primary font-bold flex justify-between items-center"
                  >
                    <span>{s.ticker}</span>
                    <span className="text-text-muted font-sans font-medium text-[9px] truncate max-w-[90px]">{s.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <select
            value={selectedSector}
            onChange={(e) => { setSelectedSector(e.target.value); setCurrentPage(1); }}
            className="bg-bg-primary border border-border-primary rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent font-sans"
          >
            <option value="all">Sectors: All</option>
            {sectorsList.map(sec => (
              <option key={sec} value={sec}>{sec.toUpperCase()}</option>
            ))}
          </select>

          <select
            value={pnlFilter}
            onChange={(e) => { setPnlFilter(e.target.value); setCurrentPage(1); }}
            className="bg-bg-primary border border-border-primary rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent font-sans"
          >
            <option value="all">P&L: All Assets</option>
            <option value="gains">📈 Daily Gains</option>
            <option value="losses">📉 Daily Losses</option>
          </select>

          {(selectedSector !== 'all' || pnlFilter !== 'all' || searchTerm) && (
            <button
              onClick={() => { setSelectedSector('all'); setPnlFilter('all'); setSearchTerm(''); }}
              className="text-[10px] font-bold text-accent hover:text-accent-hover font-mono uppercase"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* Column Toggle Menu */}
          <div className="relative">
            <button
              onClick={() => setShowColumnConfig(!showColumnConfig)}
              className="p-1 rounded bg-bg-primary border border-border-primary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition"
              title="Columns Selector"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
            {showColumnConfig && (
              <div className="absolute right-0 mt-1 w-44 bg-bg-tertiary border border-border-primary rounded shadow-panel z-50 p-2 text-[10px] space-y-1">
                <span className="font-bold text-accent uppercase font-mono block mb-1">Toggle Columns</span>
                {Object.keys(visibleColumns).map((col) => (
                  <label key={col} className="flex items-center gap-1.5 cursor-pointer hover:bg-bg-primary p-0.5 rounded">
                    <input 
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={() => toggleColumn(col)}
                      className="rounded bg-bg-secondary border border-border-primary text-accent focus:ring-accent"
                    />
                    <span className="font-mono text-text-primary select-none">{col.toUpperCase()}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-accent hover:bg-accent-hover text-bg-primary font-bold rounded transition font-sans"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">EXPORT</span>
          </button>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0 border border-border-primary rounded scrollbar-thin">
        <table className="w-full text-left border-collapse select-text table-fixed">
          <thead className="bg-bg-tertiary border-b border-border-primary sticky top-0 z-10">
            <tr>
              {visibleColumns.ticker && (
                <th 
                  onClick={() => handleSort('ticker')} 
                  style={{ width: COLUMN_WIDTHS.ticker, minWidth: COLUMN_WIDTHS.ticker }}
                  className="px-3 py-2.5 text-[10px] font-bold text-accent font-mono cursor-pointer hover:bg-bg-primary"
                >
                  TICKER <ArrowUpDown className="w-2.5 h-2.5 inline" />
                </th>
              )}
              {visibleColumns.name && (
                <th 
                  onClick={() => handleSort('name')} 
                  style={{ width: COLUMN_WIDTHS.name, minWidth: COLUMN_WIDTHS.name }}
                  className="px-3 py-2.5 text-[10px] font-bold text-accent font-mono cursor-pointer hover:bg-bg-primary"
                >
                  NAME <ArrowUpDown className="w-2.5 h-2.5 inline" />
                </th>
              )}
              {visibleColumns.quantity && (
                <th 
                  onClick={() => handleSort('quantity')} 
                  style={{ width: COLUMN_WIDTHS.quantity, minWidth: COLUMN_WIDTHS.quantity }}
                  className="px-3 py-2.5 text-[10px] font-bold text-accent font-mono cursor-pointer hover:bg-bg-primary text-right"
                >
                  QTY <ArrowUpDown className="w-2.5 h-2.5 inline" />
                </th>
              )}
              {visibleColumns.price && (
                <th 
                  onClick={() => handleSort('price')} 
                  style={{ width: COLUMN_WIDTHS.price, minWidth: COLUMN_WIDTHS.price }}
                  className="px-3 py-2.5 text-[10px] font-bold text-accent font-mono cursor-pointer hover:bg-bg-primary text-right"
                >
                  PRICE <ArrowUpDown className="w-2.5 h-2.5 inline" />
                </th>
              )}
              {visibleColumns.marketValue && (
                <th 
                  onClick={() => handleSort('marketValue')} 
                  style={{ width: COLUMN_WIDTHS.marketValue, minWidth: COLUMN_WIDTHS.marketValue }}
                  className="px-3 py-2.5 text-[10px] font-bold text-accent font-mono cursor-pointer hover:bg-bg-primary text-right"
                >
                  MV <ArrowUpDown className="w-2.5 h-2.5 inline" />
                </th>
              )}
              {visibleColumns.dailyPnL && (
                <th 
                  onClick={() => handleSort('dailyPnL')} 
                  style={{ width: COLUMN_WIDTHS.dailyPnL, minWidth: COLUMN_WIDTHS.dailyPnL }}
                  className="px-3 py-2.5 text-[10px] font-bold text-accent font-mono cursor-pointer hover:bg-bg-primary text-right"
                >
                  P&L ($) <ArrowUpDown className="w-2.5 h-2.5 inline" />
                </th>
              )}
              {visibleColumns.dailyPnLPercent && (
                <th 
                  onClick={() => handleSort('dailyPnLPercent')} 
                  style={{ width: COLUMN_WIDTHS.dailyPnLPercent, minWidth: COLUMN_WIDTHS.dailyPnLPercent }}
                  className="px-3 py-2.5 text-[10px] font-bold text-accent font-mono cursor-pointer hover:bg-bg-primary text-right"
                >
                  P&L (%) <ArrowUpDown className="w-2.5 h-2.5 inline" />
                </th>
              )}
              {visibleColumns.weight && (
                <th 
                  onClick={() => handleSort('weight')} 
                  style={{ width: COLUMN_WIDTHS.weight, minWidth: COLUMN_WIDTHS.weight }}
                  className="px-3 py-2.5 text-[10px] font-bold text-accent font-mono cursor-pointer hover:bg-bg-primary text-right"
                >
                  WT (%) <ArrowUpDown className="w-2.5 h-2.5 inline" />
                </th>
              )}
              {visibleColumns.sector && (
                <th 
                  onClick={() => handleSort('sector')} 
                  style={{ width: COLUMN_WIDTHS.sector, minWidth: COLUMN_WIDTHS.sector }}
                  className="px-3 py-2.5 text-[10px] font-bold text-accent font-mono cursor-pointer hover:bg-bg-primary"
                >
                  SECTOR <ArrowUpDown className="w-2.5 h-2.5 inline" />
                </th>
              )}
              {visibleColumns.assetClass && (
                <th 
                  onClick={() => handleSort('assetClass')} 
                  style={{ width: COLUMN_WIDTHS.assetClass, minWidth: COLUMN_WIDTHS.assetClass }}
                  className="px-3 py-2.5 text-[10px] font-bold text-accent font-mono cursor-pointer hover:bg-bg-primary"
                >
                  ASSET <ArrowUpDown className="w-2.5 h-2.5 inline" />
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-primary font-mono text-[10px] text-text-secondary bg-bg-secondary">
            {paginatedData.map((row) => {
              const isPositive = row.dailyPnL >= 0;
              const sign = isPositive ? '+' : '';
              const isSelected = row.ticker === selectedTicker;

              // Extract and compare previous price
              const prevPrice = prevPricesRef.current[row.ticker];
              const priceIncrease = prevPrice !== undefined && row.price > prevPrice;
              const priceDecrease = prevPrice !== undefined && row.price < prevPrice;

              // Store this price for the next render check
              prevPricesRef.current[row.ticker] = row.price;

              return (
                <tr 
                  key={row.ticker} 
                  onClick={() => setSelectedTicker(isSelected ? null : row.ticker)}
                  className={`
                    holdings-row hover:bg-bg-tertiary transition duration-200 select-text cursor-pointer table-row-hover
                    ${isSelected ? 'bg-accent/15 border-l-[3px] border-accent text-text-primary font-medium' : ''}
                  `}
                >
                  {visibleColumns.ticker && (
                    <td 
                      style={{ width: COLUMN_WIDTHS.ticker, minWidth: COLUMN_WIDTHS.ticker }}
                      className={`px-3 py-2 font-bold whitespace-nowrap ${isSelected ? 'text-accent' : 'text-text-primary'}`}
                    >
                      {row.ticker}
                    </td>
                  )}
                  {visibleColumns.name && (
                    <td 
                      style={{ width: COLUMN_WIDTHS.name, minWidth: COLUMN_WIDTHS.name }}
                      className="px-3 py-2 font-sans truncate" 
                      title={row.name}
                    >
                      {row.name}
                    </td>
                  )}
                  {visibleColumns.quantity && (
                    <td 
                      style={{ width: COLUMN_WIDTHS.quantity, minWidth: COLUMN_WIDTHS.quantity }}
                      className="px-3 py-2 text-right"
                    >
                      {row.quantity.toLocaleString()}
                    </td>
                  )}
                  {visibleColumns.price && (
                    <td 
                      key={`${row.ticker}-price-${row.price}`} 
                      style={{ width: COLUMN_WIDTHS.price, minWidth: COLUMN_WIDTHS.price }}
                      className={`px-3 py-2 text-right transition-all duration-300
                        ${priceIncrease ? 'animate-update-up' : priceDecrease ? 'animate-update-down' : ''}`}
                    >
                      ${row.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  )}
                  {visibleColumns.marketValue && (
                    <td 
                      style={{ width: COLUMN_WIDTHS.marketValue, minWidth: COLUMN_WIDTHS.marketValue }}
                      className="px-3 py-2 text-right font-bold text-text-primary"
                    >
                      ${row.marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  )}
                  {visibleColumns.dailyPnL && (
                    <td 
                      style={{ width: COLUMN_WIDTHS.dailyPnL, minWidth: COLUMN_WIDTHS.dailyPnL }}
                      className={`px-3 py-2 text-right font-semibold ${isPositive ? 'text-status-success' : 'text-status-danger'}`}
                    >
                      {sign}${row.dailyPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  )}
                  {visibleColumns.dailyPnLPercent && (
                    <td 
                      style={{ width: COLUMN_WIDTHS.dailyPnLPercent, minWidth: COLUMN_WIDTHS.dailyPnLPercent }}
                      className={`px-3 py-2 text-right font-semibold ${isPositive ? 'text-status-success' : 'text-status-danger'}`}
                    >
                      {sign}{row.dailyPnLPercent}%
                    </td>
                  )}
                  {visibleColumns.weight && (
                    <td 
                      style={{ width: COLUMN_WIDTHS.weight, minWidth: COLUMN_WIDTHS.weight }}
                      className="px-3 py-2 text-right font-bold text-accent"
                    >
                      {row.weight}%
                    </td>
                  )}
                  {visibleColumns.sector && (
                    <td 
                      style={{ width: COLUMN_WIDTHS.sector, minWidth: COLUMN_WIDTHS.sector }}
                      className="px-3 py-2 font-sans text-text-muted truncate"
                    >
                      {row.sector}
                    </td>
                  )}
                  {visibleColumns.assetClass && (
                    <td 
                      style={{ width: COLUMN_WIDTHS.assetClass, minWidth: COLUMN_WIDTHS.assetClass }}
                      className="px-3 py-2 text-text-muted"
                    >
                      {row.assetClass}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between mt-3 flex-shrink-0 pt-2 border-t border-border-primary/50">
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-text-muted font-mono font-bold uppercase mr-1">PAGES:</span>
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            return (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`
                  w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center transition focus:ring-1 focus:ring-accent focus:outline-none
                  ${currentPage === p 
                    ? 'bg-accent text-bg-primary font-black shadow-glow' 
                    : 'bg-bg-tertiary border border-border-primary hover:bg-bg-primary text-text-secondary'}
                `}
              >
                {p}
              </button>
            );
          })}
        </div>
        
        <div className="flex gap-1.5 items-center">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="px-2 py-0.5 text-[9px] font-bold rounded bg-bg-tertiary hover:bg-border-primary border border-border-primary disabled:opacity-20 disabled:pointer-events-none transition focus:ring-1 focus:ring-accent focus:outline-none text-text-secondary hover:text-text-primary"
          >
            PREV
          </button>
          <span className="text-[9px] font-mono text-text-muted">
            PAGE {currentPage} OF {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="px-2 py-0.5 text-[9px] font-bold rounded bg-bg-tertiary hover:bg-border-primary border border-border-primary disabled:opacity-20 disabled:pointer-events-none transition focus:ring-1 focus:ring-accent focus:outline-none text-text-secondary hover:text-text-primary"
          >
            NEXT
          </button>
        </div>
      </div>
    </div>
  );
};
export default W04_HoldingsTable;
