# Meridian Capital - Portfolio Analytics Dashboard

A production-grade, highly customizable portfolio analytics dashboard replicating the sophistication and data density of institutional trading platforms like Bloomberg Terminal, Refinitiv Eikon, and Grafana.

Managing **USD 45 billion** in assets across equities, fixed income, derivatives, and alternatives.

---

## 🚀 Key Features

1. **Fully Abstracted Widget Framework**: 12 modular financial widgets conforming to a rigid type-safe registration contract.
2. **WebSocket & REST Simulation**: Live streaming price feeds with dynamic latency controls and stale-data warning indicators.
3. **Zustand State Stores**: Granular slice selectors tracking canvas layouts, theme tokens, and custom preset templates.
4. **Responsive Drag & Resize**: GPU-accelerated grid canvas tracking coordinates and persisting configurations under 4KB (JSON).
5. **White-Label Theme Builder**: Preset themes (Meridian Dark, Bloomberg Amber, Classic Light, High Contrast) and a custom brand customizer.
6. **AAA High-Contrast Accessibility**: 100% WCAG 2.1 AA compliant keyboard navigation and high-contrast visuals.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build**: Vite 8 & PostCSS (Tailwind CSS v4)
- **Language**: TypeScript 5.0 (Strict mode)
- **State Management**: Zustand 4
- **Charts**: Recharts & Custom SVGs
- **Grid Layout**: React-Grid-Layout
- **Animations**: Framer Motion
- **Unit Testing**: Vitest & React Testing Library

---

## 📦 Getting Started

### 1. Installation
Clone the repository, navigate to the folder, and install dependencies:
```bash
cd meridian-dashboard
npm install
```

### 2. Launch Development Server
Start the high-performance local HMR dev server:
```bash
npm run dev
```

### 3. Run Build & Bundler Optimization
Compile TypeScript and compile static production chunks:
```bash
npm run build
```

### 4. Run Unit & Integration Tests
Execute the Vitest calculation test suite:
```bash
npm run test
```

---

## 📂 Project Structure

```
C:\Users\YTANNU\.gemini\antigravity\scratch\meridian-dashboard\
├── src/
│   ├── components/        # Shared UI Components (widgetShell, dashboardHeader, widgetCatalog)
│   ├── widgets/           # Individual Widgets (W01–W12)
│   ├── grid/              # Responsive Grid Canvas (gridCanvas)
│   ├── store/             # Zustand state stores (themeStore, layoutStore, dashboardStore)
│   ├── data/              # Mock Data Generator & WebSocket Simulator
│   ├── hooks/             # Custom real-time data hooks (useRealTimeData)
│   ├── types/             # Global Type definitions
│   ├── stories/           # Storybook component specifications
│   └── __tests__/         # Formula unit tests (financialFormulas.test)
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🏁 Preset Portfolio Personas

The dashboard features **5 preconfigured institutional layouts** representing various asset management roles:
- **Arjun K. (Equity PM)**: Focuses on allocations, heat maps, and detailed equity grids.
- **Sarah M. (Derivatives Trader)**: High-density option alerts, VaR gauges, and quick correlation maps.
- **Chen W. (Risk Analyst)**: Focuses on extreme drawdowns, historical stress limits, and asset-to-asset correlations.
- **Fatima R. (Fixed Income PM)**: Hybrid yield curves, performance attributions, and real-time news feeds.
- **James L. (CIO)**: Executive summary, AUM aggregations, and crawling index tickers.
