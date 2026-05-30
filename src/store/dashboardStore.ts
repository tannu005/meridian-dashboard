import { create } from 'zustand';
import { WidgetInstance, DashboardLayout } from '../types';

interface DashboardState {
  activeWidgets: WidgetInstance[];
  columns: number;
  rowHeight: number;
  gap: number;
  isSimpleMode: boolean;
  toggleSimpleMode: () => void;
  selectedTicker: string | null;
  setSelectedTicker: (ticker: string | null) => void;
  isEditing: boolean;
  setEditing: (editing: boolean) => void;
  syncWithLayout: (layout: DashboardLayout) => void;
  updateWidgetLayouts: (layouts: any[]) => void;
  addWidget: (widgetId: string, defaultSize: { w: number, h: number }) => void;
  removeWidget: (id: string) => void;
  updateWidgetConfig: (id: string, config: Record<string, any>) => void;
  clearDashboard: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activeWidgets: [],
  columns: 12,
  rowHeight: 70,
  gap: 8,
  isEditing: false,
  isSimpleMode: true,
  toggleSimpleMode: () => set((state) => ({ isSimpleMode: !state.isSimpleMode })),
  selectedTicker: null,
  setSelectedTicker: (selectedTicker) => set({ selectedTicker }),
  setEditing: (isEditing) => set({ isEditing }),
  
  syncWithLayout: (layout) => {
    set({
      activeWidgets: layout.widgets,
      columns: layout.columns,
      rowHeight: layout.rowHeight,
      gap: layout.gap,
    });
  },
  
  updateWidgetLayouts: (layouts) => {
    set((state) => {
      const updated = state.activeWidgets.map((w) => {
        const matchingLayout = layouts.find((l) => l.i === w.id);
        if (matchingLayout) {
          return {
            ...w,
            layout: {
              ...w.layout,
              x: matchingLayout.x,
              y: matchingLayout.y,
              w: matchingLayout.w,
              h: matchingLayout.h,
            },
          };
        }
        return w;
      });
      return { activeWidgets: updated };
    });
  },
  
  addWidget: (widgetId, defaultSize) => {
    set((state) => {
      const id = `inst-${widgetId}-${Date.now().toString().slice(-4)}`;
      
      // Compute Y-coordinate to place widget at the bottom of the grid
      let maxY = 0;
      state.activeWidgets.forEach((w) => {
        const bottom = w.layout.y + w.layout.h;
        if (bottom > maxY) maxY = bottom;
      });
      
      const newInstance: WidgetInstance = {
        id,
        widgetId,
        layout: {
          x: 0,
          y: maxY,
          w: defaultSize.w,
          h: defaultSize.h,
          i: id,
        },
        config: {},
      };
      
      return {
        activeWidgets: [...state.activeWidgets, newInstance],
      };
    });
  },
  
  removeWidget: (id) => {
    set((state) => ({
      activeWidgets: state.activeWidgets.filter((w) => w.id !== id),
    }));
  },
  
  updateWidgetConfig: (id: string, config: Record<string, any>) => {
    set((state) => ({
      activeWidgets: state.activeWidgets.map((w) => 
        w.id === id ? { ...w, config: { ...w.config, ...config } } : w
      ),
    }));
  },
  
  clearDashboard: () => {
    set({ activeWidgets: [] });
  },
}));
