import { ComponentType } from 'react';

export type WidgetCategory = 'CHART' | 'TABLE' | 'FEED' | 'GAUGE' | 'ANALYSIS';

export interface Size {
  w: number;
  h: number;
}

export interface DataSourceConfig {
  channel: string;
  intervalMs: number;
  requiredFields?: string[];
}

export interface WidgetComponentProps<TConfig = any, TData = any> {
  instanceId: string;
  config: TConfig;
  data: TData;
  isStale: boolean;
  lastUpdated: Date | null;
  refetch: () => void;
}

export interface WidgetDefinition<TConfig = any, TData = any> {
  id: string;
  name: string;
  description: string;
  category: WidgetCategory;
  defaultSize: Size;
  minSize: Size;
  maxSize?: Size;
  configSchema: Record<string, any>; // Simplified JSON Schema validation
  defaultConfig: TConfig;
  component: ComponentType<WidgetComponentProps<TConfig, TData>>;
  icon: ComponentType<{ className?: string }>;
  dataSource: DataSourceConfig;
}

export interface WidgetInstance {
  id: string; // Unique instance ID, e.g. "inst-w01-9273"
  widgetId: string; // Pointer to WidgetDefinition.id, e.g. "W01"
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
    i: string; // Same as instanceId for react-grid-layout
  };
  config: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: WidgetInstance[];
  columns: number;
  rowHeight: number;
  gap: number;
}

export type ThemeType = 'meridian-dark' | 'bloomberg' | 'light' | 'high-contrast' | 'custom';

export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentMuted: string;
  borderPrimary: string;
  borderSecondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  chart6: string;
}

/* Financial Data Models */

export interface MockHolding {
  ticker: string;
  name: string;
  quantity: number;
  price: number;
  costBasis: number;
  marketValue: number;
  dailyPnL: number;
  dailyPnLPercent: number;
  weight: number;
  sector: string;
  assetClass: 'Equity' | 'Fixed Income' | 'Derivative' | 'Alternative';
}

export interface PortfolioSummary {
  aum: number;
  aumChange24h: number;
  aumChangePercent24h: number;
  nav: number;
  navChange24h: number;
  navChangePercent24h: number;
  sharpeRatio: number;
  maxDrawdown: number;
  dailyVaR: number;
  dailyVaRConfidence: number;
}

export interface NavDataPoint {
  date: string;
  nav: number;
  nifty50: number;
  sp500: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: 'Reuters' | 'Bloomberg' | 'Economic Times' | 'Moneycontrol';
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
}

export interface AlertNotification {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  snoozedUntil?: Date | null;
  category: 'price' | 'risk' | 'news' | 'system';
}

export interface CorrelationData {
  tickers: string[];
  matrix: number[][];
}

export interface BrinsonAttribution {
  sector: string;
  allocationEffect: number; // bps
  selectionEffect: number; // bps
  interactionEffect: number; // bps
  excessReturn: number; // bps
}

export interface DrawdownDataPoint {
  date: string;
  portfolio: number;
  drawdown: number;
  nifty50Drawdown: number;
}

export interface ExposureDataPoint {
  name: string;
  path: string;
  value: number;
  pnlPercent: number;
}
