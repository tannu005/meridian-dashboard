import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DashboardLayout, WidgetInstance } from '../types';

interface LayoutState {
  savedLayouts: Record<string, DashboardLayout>;
  activeLayoutId: string;
  loadLayout: (layoutId: string) => void;
  saveCustomLayout: (name: string, description: string, widgets: WidgetInstance[]) => void;
  deleteLayout: (layoutId: string) => void;
  importLayout: (jsonString: string) => { success: boolean; error?: string };
  exportLayout: (layoutId: string) => string;
}

// 5 pre-defined institutional layouts
export const PRESETS: Record<string, DashboardLayout> = {
  beginner_simple: {
    id: 'beginner_simple',
    name: '🎓 Beginner (Simple Mode)',
    description: 'Clean, simplified view with only core allocation and holding metrics.',
    columns: 12,
    rowHeight: 75,
    gap: 12,
    widgets: [
      { id: 'alloc-pie-1', widgetId: 'W01', layout: { x: 0, y: 0, w: 4, h: 5, i: 'alloc-pie-1' }, config: { dimension: 'assetClass', style: 'donut' } },
      { id: 'holdings-1', widgetId: 'W04', layout: { x: 4, y: 0, w: 8, h: 5, i: 'holdings-1' }, config: {} },
    ]
  },
  arjun_equity: {
    id: 'arjun_equity',
    name: 'Arjun K. (Equity PM)',
    description: 'Focuses on portfolio allocation, sector heat maps, performance comparison, and individual equity holdings.',
    columns: 12,
    rowHeight: 70,
    gap: 8,
    widgets: [
      { id: 'ticker-1', widgetId: 'W10', layout: { x: 0, y: 0, w: 12, h: 1, i: 'ticker-1' }, config: {} },
      { id: 'perf-line-1', widgetId: 'W02', layout: { x: 0, y: 1, w: 8, h: 5, i: 'perf-line-1' }, config: { benchmark: 'nifty50', dateRange: '3M' } },
      { id: 'alloc-pie-1', widgetId: 'W01', layout: { x: 8, y: 1, w: 4, h: 5, i: 'alloc-pie-1' }, config: { dimension: 'sector', style: 'donut' } },
      { id: 'heatmap-1', widgetId: 'W03', layout: { x: 0, y: 6, w: 8, h: 5, i: 'heatmap-1' }, config: {} },
      { id: 'news-1', widgetId: 'W05', layout: { x: 8, y: 6, w: 4, h: 5, i: 'news-1' }, config: { category: 'all' } },
      { id: 'holdings-1', widgetId: 'W04', layout: { x: 0, y: 11, w: 12, h: 5, i: 'holdings-1' }, config: {} },
    ]
  },
  sarah_derivatives: {
    id: 'sarah_derivatives',
    name: 'Sarah M. (Derivatives Trader)',
    description: 'Dense 4-column layout for real-time monitoring of alerts, risk, option greeks, and high-frequency price ticker updates.',
    columns: 12,
    rowHeight: 65,
    gap: 6,
    widgets: [
      { id: 'ticker-1', widgetId: 'W10', layout: { x: 0, y: 0, w: 12, h: 1, i: 'ticker-1' }, config: {} },
      { id: 'alerts-1', widgetId: 'W06', layout: { x: 0, y: 1, w: 4, h: 4, i: 'alerts-1' }, config: { minSeverity: 'warning' } },
      { id: 'var-gauge-1', widgetId: 'W07', layout: { x: 4, y: 1, w: 4, h: 4, i: 'var-gauge-1' }, config: { confidence: 0.99, type: 'parametric' } },
      { id: 'holdings-1', widgetId: 'W04', layout: { x: 8, y: 1, w: 4, h: 4, i: 'holdings-1' }, config: { assetClass: 'Derivative' } },
      { id: 'correlation-1', widgetId: 'W08', layout: { x: 0, y: 5, w: 6, h: 6, i: 'correlation-1' }, config: { lookbackDays: 30 } },
      { id: 'news-1', widgetId: 'W05', layout: { x: 6, y: 5, w: 6, h: 6, i: 'news-1' }, config: {} },
      { id: 'system-1', widgetId: 'W13', layout: { x: 0, y: 11, w: 12, h: 4, i: 'system-1' }, config: {} }
    ]
  },
  chen_risk: {
    id: 'chen_risk',
    name: 'Chen W. (Risk Analyst)',
    description: 'Designed for stress analysis, extreme drawdowns, asset-to-asset correlations, and Value-at-Risk parameters.',
    columns: 12,
    rowHeight: 70,
    gap: 8,
    widgets: [
      { id: 'var-gauge-1', widgetId: 'W07', layout: { x: 0, y: 0, w: 6, h: 4, i: 'var-gauge-1' }, config: { confidence: 0.99, type: 'historical' } },
      { id: 'drawdown-1', widgetId: 'W11', layout: { x: 6, y: 0, w: 6, h: 4, i: 'drawdown-1' }, config: { lookbackDays: 252 } },
      { id: 'correlation-1', widgetId: 'W08', layout: { x: 0, y: 4, w: 6, h: 5, i: 'correlation-1' }, config: { lookbackDays: 90 } },
      { id: 'treemap-1', widgetId: 'W12', layout: { x: 6, y: 4, w: 6, h: 5, i: 'treemap-1' }, config: { sizeMetric: 'riskContribution' } },
      { id: 'holdings-1', widgetId: 'W04', layout: { x: 0, y: 9, w: 12, h: 5, i: 'holdings-1' }, config: {} },
      { id: 'system-1', widgetId: 'W13', layout: { x: 0, y: 14, w: 12, h: 4, i: 'system-1' }, config: {} }
    ]
  },
  fatima_fixed_income: {
    id: 'fatima_fixed_income',
    name: 'Fatima R. (Fixed Income PM)',
    description: 'Hybrid monitoring setup highlighting yields, performance attributions, asset weightings, and real-time news streams.',
    columns: 12,
    rowHeight: 75,
    gap: 8,
    widgets: [
      { id: 'perf-line-1', widgetId: 'W02', layout: { x: 0, y: 0, w: 8, h: 5, i: 'perf-line-1' }, config: { benchmark: 'sp500' } },
      { id: 'alerts-1', widgetId: 'W06', layout: { x: 0, y: 0, w: 8, h: 5, i: 'alerts-1' }, config: {} },
      { id: 'attrib-1', widgetId: 'W09', layout: { x: 0, y: 5, w: 8, h: 5, i: 'attrib-1' }, config: { attributionType: 'bps' } },
      { id: 'alloc-pie-1', widgetId: 'W01', layout: { x: 8, y: 5, w: 4, h: 5, i: 'alloc-pie-1' }, config: { dimension: 'assetClass' } }
    ]
  },
  james_cio: {
    id: 'james_cio',
    name: 'James L. (CIO)',
    description: 'Executive-level summary providing AUM high-level asset mixes, total Sharpe ratios, and macro market crawlers.',
    columns: 12,
    rowHeight: 70,
    gap: 10,
    widgets: [
      { id: 'ticker-1', widgetId: 'W10', layout: { x: 0, y: 0, w: 12, h: 1, i: 'ticker-1' }, config: {} },
      { id: 'alloc-pie-1', widgetId: 'W01', layout: { x: 0, y: 1, w: 4, h: 4, i: 'alloc-pie-1' }, config: { style: 'pie', dimension: 'assetClass' } },
      { id: 'var-gauge-1', widgetId: 'W07', layout: { x: 4, y: 1, w: 3, h: 4, i: 'var-gauge-1' }, config: { confidence: 0.95 } },
      { id: 'perf-line-1', widgetId: 'W02', layout: { x: 7, y: 1, w: 5, h: 4, i: 'perf-line-1' }, config: { dateRange: 'YTD' } },
      { id: 'heatmap-1', widgetId: 'W03', layout: { x: 0, y: 5, w: 6, h: 5, i: 'heatmap-1' }, config: {} },
      { id: 'attrib-1', widgetId: 'W09', layout: { x: 6, y: 5, w: 6, h: 5, i: 'attrib-1' }, config: {} }
    ]
  }
};

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set, get) => ({
      savedLayouts: PRESETS,
      activeLayoutId: 'beginner_simple',
      loadLayout: (layoutId) => {
        if (get().savedLayouts[layoutId]) {
          set({ activeLayoutId: layoutId });
        }
      },
      saveCustomLayout: (name, description, widgets) => {
        const id = `custom_${Date.now()}`;
        const newLayout: DashboardLayout = {
          id,
          name,
          description,
          widgets,
          columns: 12,
          rowHeight: 70,
          gap: 8
        };
        
        set((state) => ({
          savedLayouts: {
            ...state.savedLayouts,
            [id]: newLayout
          },
          activeLayoutId: id
        }));
      },
      deleteLayout: (layoutId) => {
        // Prevent deleting presets
        if (PRESETS[layoutId]) return;
        
        set((state) => {
          const newSaved = { ...state.savedLayouts };
          delete newSaved[layoutId];
          
          // Fall back to beginner_simple
          const nextActive = state.activeLayoutId === layoutId ? 'beginner_simple' : state.activeLayoutId;
          
          return {
            savedLayouts: newSaved,
            activeLayoutId: nextActive
          };
        });
      },
      importLayout: (jsonString) => {
        try {
          if (jsonString.length > 50 * 1024) {
            return { success: false, error: 'Layout size exceeds the 50KB limit' };
          }
          
          const parsed = JSON.parse(jsonString);
          if (!parsed.id || !parsed.name || !Array.isArray(parsed.widgets)) {
            return { success: false, error: 'Invalid layout schema definition' };
          }
          
          const id = parsed.id.startsWith('custom_') ? parsed.id : `custom_${Date.now()}`;
          const validatedLayout: DashboardLayout = {
            id,
            name: parsed.name,
            description: parsed.description || 'Imported layout config',
            columns: parsed.columns || 12,
            rowHeight: parsed.rowHeight || 70,
            gap: parsed.gap || 8,
            widgets: parsed.widgets
          };
          
          set((state) => ({
            savedLayouts: {
              ...state.savedLayouts,
              [id]: validatedLayout
            },
            activeLayoutId: id
          }));
          
          return { success: true };
        } catch (e: any) {
          return { success: false, error: e.message || 'JSON parsing failed' };
        }
      },
      exportLayout: (layoutId) => {
        const layout = get().savedLayouts[layoutId];
        if (!layout) return '';
        return JSON.stringify(layout, null, 2);
      }
    }),
    {
      name: 'meridian-layout-store-v2',
    }
  )
);
