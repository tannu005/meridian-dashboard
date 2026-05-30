import React from 'react';
import { 
  PieChart, 
  TrendingUp, 
  Activity, 
  Table, 
  Newspaper, 
  Bell, 
  Gauge, 
  Grid, 
  BarChart3, 
  Play, 
  LineChart, 
  Layers 
} from 'lucide-react';
import { WidgetDefinition } from '../types';

// Lazy load all widget components
const W01_Component = React.lazy(() => import('../widgets/W01_PortfolioAllocation'));
const W02_Component = React.lazy(() => import('../widgets/W02_PerformanceLine'));
const W03_Component = React.lazy(() => import('../widgets/W03_SectorHeatMap'));
const W04_Component = React.lazy(() => import('../widgets/W04_HoldingsTable'));
const W05_Component = React.lazy(() => import('../widgets/W05_NewsFeed'));
const W06_Component = React.lazy(() => import('../widgets/W06_AlertPanel'));
const W07_Component = React.lazy(() => import('../widgets/W07_VaRGauge'));
const W08_Component = React.lazy(() => import('../widgets/W08_CorrelationMatrix'));
const W09_Component = React.lazy(() => import('../widgets/W09_PerformanceAttribution'));
const W10_Component = React.lazy(() => import('../widgets/W10_MarketTicker'));
const W11_Component = React.lazy(() => import('../widgets/W11_DrawdownChart'));
const W12_Component = React.lazy(() => import('../widgets/W12_ExposureTreemap'));
const W13_Component = React.lazy(() => import('../widgets/W13_SystemStatus'));


export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  W01: {
    id: 'W01',
    name: 'Portfolio Allocation',
    description: 'Interactive donut/pie chart showing allocation by asset class, sector, geography, or custom grouping with click drill-downs.',
    category: 'CHART',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    dataSource: { channel: 'holdings', intervalMs: 30000 },
    icon: PieChart,
    defaultConfig: {
      dimension: 'sector',
      style: 'donut',
      showLabels: true,
    },
    configSchema: {
      dimension: { type: 'select', label: 'Grouping Dimension', options: ['sector', 'assetClass'] },
      style: { type: 'select', label: 'Chart Style', options: ['donut', 'pie'] },
      showLabels: { type: 'boolean', label: 'Show Slice Labels' },
    },
    component: W01_Component
  },
  W02: {
    id: 'W02',
    name: 'Performance Line Chart',
    description: 'Compares active portfolio NAV performance against major index benchmarks (Nifty 50, S&P 500) with logarithmic scale, zoom, and crosshair.',
    category: 'CHART',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    dataSource: { channel: 'navHistory', intervalMs: 60000 },
    icon: TrendingUp,
    defaultConfig: {
      benchmark: 'nifty50',
      scaleType: 'linear',
      dateRange: '3M',
    },
    configSchema: {
      benchmark: { type: 'select', label: 'Benchmark', options: ['nifty50', 'sp500', 'both'] },
      scaleType: { type: 'select', label: 'Scale Type', options: ['linear', 'log'] },
      dateRange: { type: 'select', label: 'Date Range', options: ['1W', '1M', '3M', '6M', 'YTD', '1Y'] },
    },
    component: W02_Component
  },
  W03: {
    id: 'W03',
    name: 'Sector Heat Map',
    description: 'Treemap showing P&L color distributions mapped against total market capitalization sizes for individual sector holdings.',
    category: 'CHART',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    dataSource: { channel: 'holdings', intervalMs: 15000 },
    icon: Grid,
    defaultConfig: {
      colorScheme: 'greenRed',
    },
    configSchema: {
      colorScheme: { type: 'select', label: 'Color Scale', options: ['greenRed', 'blueOrange'] },
    },
    component: W03_Component
  },
  W04: {
    id: 'W04',
    name: 'Holdings Data Table',
    description: 'Sortable, filterable institutional data grid with CSV exporting, search, and dynamic column controls.',
    category: 'TABLE',
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    dataSource: { channel: 'holdings', intervalMs: 10000 },
    icon: Table,
    defaultConfig: {
      assetClass: 'all',
      rowsPerPage: 10,
    },
    configSchema: {
      assetClass: { type: 'select', label: 'Asset Class Filter', options: ['all', 'Equity', 'Fixed Income', 'Derivative'] },
      rowsPerPage: { type: 'select', label: 'Page Limit', options: [5, 10, 20, 50] },
    },
    component: W04_Component
  },
  W05: {
    id: 'W05',
    name: 'News & Research Feed',
    description: 'Institutional article aggregator showing real-time market wires, keyword filters, and NLP sentiment indexing badges.',
    category: 'FEED',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    dataSource: { channel: 'news', intervalMs: 20000 },
    icon: Newspaper,
    defaultConfig: {
      category: 'all',
    },
    configSchema: {
      category: { type: 'select', label: 'Source Filter', options: ['all', 'Reuters', 'Bloomberg', 'Economic Times'] },
    },
    component: W05_Component
  },
  W06: {
    id: 'W06',
    name: 'Alert Panel',
    description: 'Real-time monitoring panel displaying active regulatory compliance checks, limit breaks, and snoozable notifications.',
    category: 'FEED',
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 3 },
    dataSource: { channel: 'alerts', intervalMs: 15000 },
    icon: Bell,
    defaultConfig: {
      minSeverity: 'info',
    },
    configSchema: {
      minSeverity: { type: 'select', label: 'Minimum Severity', options: ['info', 'warning', 'critical'] },
    },
    component: W06_Component
  },
  W07: {
    id: 'W07',
    name: 'Value-at-Risk (VaR) Gauge',
    description: 'Speedometer dial mapping parametric and historical VaR risks against strict corporate safety limits.',
    category: 'GAUGE',
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    dataSource: { channel: 'summary', intervalMs: 60000 },
    icon: Gauge,
    defaultConfig: {
      confidence: 0.99,
      type: 'parametric',
      varLimit: 50000000, // 50M limit
    },
    configSchema: {
      confidence: { type: 'select', label: 'Confidence Level', options: [0.95, 0.99] },
      type: { type: 'select', label: 'Calculation Model', options: ['parametric', 'historical'] },
    },
    component: W07_Component
  },
  W08: {
    id: 'W08',
    name: 'Correlation Matrix',
    description: 'Diverging heat map showing statistical correlation matrices for assets with scatterplot details.',
    category: 'ANALYSIS',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    dataSource: { channel: 'correlation', intervalMs: 300000 },
    icon: Activity,
    defaultConfig: {
      lookbackDays: 90,
    },
    configSchema: {
      lookbackDays: { type: 'select', label: 'Lookback Window', options: [30, 90, 252] },
    },
    component: W08_Component
  },
  W09: {
    id: 'W09',
    name: 'Brinson Attribution Bar Chart',
    description: 'Stacked bar representation showing Brinson performance attributions (Allocation vs Selection effects).',
    category: 'CHART',
    defaultSize: { w: 5, h: 4 },
    minSize: { w: 4, h: 3 },
    dataSource: { channel: 'brinson', intervalMs: 120000 },
    icon: BarChart3,
    defaultConfig: {
      attributionType: 'bps',
    },
    configSchema: {
      attributionType: { type: 'select', label: 'Display Metric', options: ['bps', 'percent'] },
    },
    component: W09_Component
  },
  W10: {
    id: 'W10',
    name: 'Market Overview Ticker',
    description: 'Crawling horizontal ribbon showing major indexes, currency quotes, commodities, and micro sparkline summaries.',
    category: 'FEED',
    defaultSize: { w: 12, h: 1 },
    minSize: { w: 6, h: 1 },
    dataSource: { channel: 'summary', intervalMs: 5000 },
    icon: Play,
    defaultConfig: {
      tickerSpeed: 'normal',
    },
    configSchema: {
      tickerSpeed: { type: 'select', label: 'Scroll Speed', options: ['slow', 'normal', 'fast'] },
    },
    component: W10_Component
  },
  W11: {
    id: 'W11',
    name: 'Drawdown Chart (Distinction)',
    description: 'Area graph showing peak-to-trough historical drawdowns, crash durations, and recovery curves.',
    category: 'CHART',
    defaultSize: { w: 5, h: 4 },
    minSize: { w: 4, h: 3 },
    dataSource: { channel: 'drawdown', intervalMs: 60000 },
    icon: LineChart,
    defaultConfig: {
      lookbackDays: 252,
    },
    configSchema: {
      lookbackDays: { type: 'select', label: 'Lookback Window', options: [90, 252, 500] },
    },
    component: W11_Component
  },
  W12: {
    id: 'W12',
    name: 'Exposure Treemap (Distinction)',
    description: 'Multi-layer hierarchical zoom graph representing portfolio geographical, asset-class, and sector exposure weights.',
    category: 'CHART',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    dataSource: { channel: 'exposure', intervalMs: 300000 },
    icon: Layers,
    defaultConfig: {
      sizeMetric: 'marketValue',
    },
    configSchema: {
      sizeMetric: { type: 'select', label: 'Sizing Metric', options: ['marketValue', 'riskContribution'] },
    },
    component: W12_Component
  },
  W13: {
    id: 'W13',
    name: 'System Status & Simulator',
    description: 'Consolidated developer analytics and simulation controls. Monitors real-time client re-render delay, frame-rate (FPS) smoothness, and stream throughput.',
    category: 'ANALYSIS',
    defaultSize: { w: 4, h: 4 },
    minSize: { w: 3, h: 3 },
    dataSource: { channel: 'summary', intervalMs: 5000 },
    icon: Activity,
    defaultConfig: {},
    configSchema: {},
    component: W13_Component
  }
};
