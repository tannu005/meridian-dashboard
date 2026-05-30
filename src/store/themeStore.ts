import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeType, ThemeColors } from '../types';

interface ThemeState {
  activeTheme: ThemeType;
  pendingTheme: ThemeType | null;
  customColors: ThemeColors;
  setTheme: (theme: ThemeType) => void;
  commitTheme: () => void;
  updateCustomColors: (colors: Partial<ThemeColors>) => void;
}

const defaultCustomColors: ThemeColors = {
  bgPrimary: '#0A0E17',
  bgSecondary: '#121824',
  bgTertiary: '#1A2333',
  textPrimary: '#FFFFFF',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  accent: '#10B981', // Premium custom green
  accentHover: '#059669',
  accentMuted: 'rgba(16, 185, 129, 0.25)',
  borderPrimary: '#1E293B',
  borderSecondary: '#334155',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  chart1: '#10B981',
  chart2: '#6366F1',
  chart3: '#3B82F6',
  chart4: '#F59E0B',
  chart5: '#EC4899',
  chart6: '#8B5CF6',
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      activeTheme: 'meridian-dark',
      pendingTheme: null,
      customColors: defaultCustomColors,
      setTheme: (theme) => {
        set({ pendingTheme: theme });
      },
      commitTheme: () => {
        const pending = get().pendingTheme;
        if (pending) {
          set({ activeTheme: pending, pendingTheme: null });
          get().updateCustomColors({}); // Trigger CSS property generation
        }
      },
      updateCustomColors: (colors) => {
        set((state) => {
          const newColors = { ...state.customColors, ...colors };
          
          // Inject custom CSS variables into document root if custom theme is selected
          const activeTheme = state.activeTheme;
          const targetThemeColors = activeTheme === 'custom' ? newColors : null;
          
          // Apply active theme class to body
          const body = document.body;
          body.classList.remove('theme-meridian-dark', 'theme-bloomberg', 'theme-light', 'theme-high-contrast', 'theme-custom');
          body.classList.add(`theme-${activeTheme}`);
          
          if (activeTheme === 'custom' && targetThemeColors) {
            const root = document.documentElement;
            root.style.setProperty('--color-bg-primary', targetThemeColors.bgPrimary);
            root.style.setProperty('--color-bg-secondary', targetThemeColors.bgSecondary);
            root.style.setProperty('--color-bg-tertiary', targetThemeColors.bgTertiary);
            root.style.setProperty('--color-text-primary', targetThemeColors.textPrimary);
            root.style.setProperty('--color-text-secondary', targetThemeColors.textSecondary);
            root.style.setProperty('--color-text-muted', targetThemeColors.textMuted);
            root.style.setProperty('--color-accent', targetThemeColors.accent);
            root.style.setProperty('--color-accent-hover', targetThemeColors.accentHover);
            root.style.setProperty('--color-accent-muted', targetThemeColors.accentMuted);
            root.style.setProperty('--color-border-primary', targetThemeColors.borderPrimary);
            root.style.setProperty('--color-border-secondary', targetThemeColors.borderSecondary);
            root.style.setProperty('--color-success', targetThemeColors.success);
            root.style.setProperty('--color-warning', targetThemeColors.warning);
            root.style.setProperty('--color-danger', targetThemeColors.danger);
            root.style.setProperty('--color-info', targetThemeColors.info);
            root.style.setProperty('--color-chart-1', targetThemeColors.chart1);
            root.style.setProperty('--color-chart-2', targetThemeColors.chart2);
            root.style.setProperty('--color-chart-3', targetThemeColors.chart3);
            root.style.setProperty('--color-chart-4', targetThemeColors.chart4);
            root.style.setProperty('--color-chart-5', targetThemeColors.chart5);
            root.style.setProperty('--color-chart-6', targetThemeColors.chart6);
          } else {
            // Clear any inline styles if we switched back to presets
            const root = document.documentElement;
            const styleKeys = [
              'bg-primary', 'bg-secondary', 'bg-tertiary', 
              'text-primary', 'text-secondary', 'text-muted', 
              'accent', 'accent-hover', 'accent-muted', 
              'border-primary', 'border-secondary', 
              'success', 'warning', 'danger', 'info',
              'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5', 'chart-6'
            ];
            styleKeys.forEach(k => root.style.removeProperty(`--color-${k}`));
          }
          
          return { customColors: newColors };
        });
      },
    }),
    {
      name: 'meridian-theme-store',
    }
  )
);
