import React, { useState, useEffect } from 'react';
import { useLayoutStore } from '../store/layoutStore';
import { useDashboardStore } from '../store/dashboardStore';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { 
  Settings2, 
  Download, 
  Upload, 
  LayoutGrid,
  LogOut
} from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  // Zustand Stores
  const { savedLayouts, activeLayoutId, loadLayout, saveCustomLayout, importLayout, exportLayout } = useLayoutStore();
  const { isEditing, setEditing, activeWidgets, syncWithLayout, isSimpleMode, toggleSimpleMode } = useDashboardStore();
  const { activeTheme, setTheme, customColors, updateCustomColors } = useThemeStore();
  const logout = useAuthStore((state) => state.logout);

  // Local state controls
  const [showThemeBuilder, setShowThemeBuilder] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [importJson, setImportJson] = useState('');
  const [importErr, setImportErr] = useState('');
  const [layoutName, setLayoutName] = useState('');
  const [layoutDesc, setLayoutDesc] = useState('');

  // Initial Layout Sync
  useEffect(() => {
    const current = savedLayouts[activeLayoutId];
    if (current) {
      syncWithLayout(current);
    }
  }, [activeLayoutId, savedLayouts]);

  const handleExport = () => {
    const json = exportLayout(activeLayoutId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeLayoutId}_layout_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    setImportErr('');
    const res = importLayout(importJson);
    if (res.success) {
      setShowImportDialog(false);
      setImportJson('');
    } else {
      setImportErr(res.error || 'Import failed');
    }
  };

  const handleSaveSubmit = () => {
    if (!layoutName) return;
    saveCustomLayout(layoutName, layoutDesc, activeWidgets);
    setShowSaveDialog(false);
    setLayoutName('');
    setLayoutDesc('');
  };

  return (
    <header 
      className="w-[calc(100%-2rem)] max-w-[1400px] mx-auto mt-4 rounded-full border border-border-primary bg-bg-secondary/80 backdrop-blur-xl text-text-primary px-4 md:px-6 py-2.5 select-none flex-shrink-0 z-50 sticky top-4 shadow-panel transition-all duration-500"
      role="banner"
      aria-label="Dashboard Control Panel"
    >
      {/* Brand, Presets & Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-tr from-accent to-indigo-500 flex items-center justify-center font-bold text-bg-primary text-xs shadow-glow">
            M
          </div>
          <span className="text-sm font-bold font-sans uppercase tracking-widest text-text-primary">
            Meridian <span className="text-accent">Capital</span>
          </span>
        </div>

        {/* Center: Presets & Theme */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Layout Presets dropdown */}
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-3.5 h-3.5 text-accent" />
            <label className="text-[11px] text-text-muted font-mono uppercase font-bold">Persona:</label>
            <select 
              value={activeLayoutId}
              onChange={(e) => loadLayout(e.target.value)}
              className="bg-bg-primary border border-border-primary rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent font-sans font-bold"
            >
              {Object.entries(savedLayouts).map(([id, lay]) => (
                <option key={id} value={id}>{lay.name}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Theme Presets dropdown */}
          <div className="flex items-center gap-2">
            <select 
              value={activeTheme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="bg-bg-primary border border-border-primary rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent font-sans font-bold"
            >
              <option value="meridian-dark">💎 MERIDIAN DARK</option>
              <option value="bloomberg">🔸 BLOOMBERG WIRE</option>
              <option value="light">🔆 CLASSIC LIGHT</option>
              <option value="high-contrast">🏁 HIGH CONTRAST</option>
              <option value="custom">🛠️ BRAND BUILDER</option>
            </select>
            {activeTheme === 'custom' && (
              <button
                onClick={() => setShowThemeBuilder(!showThemeBuilder)}
                className="p-1 rounded bg-bg-primary border border-border-primary hover:bg-bg-tertiary transition text-accent focus:ring-2 focus:ring-accent focus:outline-none"
                title="Theme Token Customizer"
              >
                <Settings2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Layout Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleSimpleMode}
            className={`px-3 py-1.5 rounded font-sans font-bold uppercase transition text-[11px] shadow-sm border focus:ring-2 focus:ring-accent focus:outline-none
              ${isSimpleMode 
                ? 'bg-accent border-accent text-bg-primary font-black shadow-glow' 
                : 'bg-bg-tertiary border-border-primary hover:bg-bg-primary text-text-primary'}
            `}
            title="Toggle simplified beginner-friendly views with clean definitions"
          >
            {isSimpleMode ? '🎓 Simple Mode: ON' : '🎓 Simple Mode: OFF'}
          </button>

          {isSimpleMode && (
            <button
              onClick={() => { setTourStep(0); setShowTourModal(true); }}
              className="px-3 py-1.5 rounded bg-bg-tertiary border border-border-primary text-accent hover:bg-bg-primary transition font-sans font-bold text-[11px] focus:ring-2 focus:ring-accent focus:outline-none"
            >
              🚀 Start Tour
            </button>
          )}

          <button
            onClick={() => setEditing(!isEditing)}
            className={`px-3 py-1.5 rounded font-sans font-bold uppercase transition text-[11px] shadow-sm focus:ring-2 focus:ring-accent focus:outline-none
              ${isEditing ? 'bg-status-success hover:bg-status-success text-bg-primary' : 'bg-bg-tertiary hover:bg-border-primary border border-border-primary text-text-primary'}
            `}
          >
            {isEditing ? 'Done Editing' : 'Customize Canvas'}
          </button>
          
          <button
            onClick={() => setShowSaveDialog(true)}
            className="px-3 py-1.5 rounded bg-bg-tertiary hover:bg-border-primary border border-border-primary text-text-primary transition font-sans font-bold text-[11px] focus:ring-2 focus:ring-accent focus:outline-none"
            title="Save Active Canvas layout to presets"
          >
            SAVE
          </button>

          <button
            onClick={handleExport}
            className="p-1.5 rounded bg-bg-tertiary hover:bg-border-primary border border-border-primary text-text-secondary hover:text-text-primary transition focus:ring-2 focus:ring-accent focus:outline-none"
            title="Export Layout as JSON (<50KB)"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowImportDialog(true)}
            className="p-1.5 rounded bg-bg-tertiary hover:bg-border-primary border border-border-primary text-text-secondary hover:text-text-primary transition focus:ring-2 focus:ring-accent focus:outline-none"
            title="Import Layout JSON"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-6 bg-border-primary mx-1"></div>

          <button
            onClick={logout}
            className="p-1.5 rounded bg-status-danger/10 hover:bg-status-danger/20 border border-status-danger/30 text-status-danger transition focus:ring-2 focus:ring-status-danger focus:outline-none flex items-center justify-center gap-1.5 px-3 font-sans font-bold text-[11px] uppercase tracking-wider"
            title="Secure Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Save Layout Dialog modal overlay */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[150] animate-fade-in p-4">
          <div className="bg-bg-secondary border border-border-primary rounded-lg p-5 w-full max-w-sm shadow-panel">
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider font-mono mb-3">Save Custom Layout</h3>
            <div className="space-y-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-text-secondary font-mono">LAYOUT NAME</label>
                <input 
                  type="text"
                  placeholder="e.g. My Option Greek View"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-text-secondary font-mono">DESCRIPTION</label>
                <textarea 
                  placeholder="Summary of layout purpose..."
                  value={layoutDesc}
                  onChange={(e) => setLayoutDesc(e.target.value)}
                  className="w-full bg-bg-primary border border-border-primary rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent h-16 resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 text-xs">
              <button 
                onClick={() => setShowSaveDialog(false)}
                className="px-3 py-1.5 text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSubmit}
                disabled={!layoutName}
                className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-bg-primary font-bold rounded transition disabled:opacity-35"
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import JSON Dialog modal overlay */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[150] animate-fade-in p-4">
          <div className="bg-bg-secondary border border-border-primary rounded-lg p-5 w-full max-w-md shadow-panel">
            <h3 className="text-xs font-bold text-accent uppercase tracking-wider font-mono mb-3">Import Layout configuration</h3>
            <textarea 
              placeholder="Paste serialized Layout JSON here (<50KB)..."
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="w-full h-40 bg-bg-primary border border-border-primary rounded p-2 text-xs text-text-primary focus:outline-none focus:border-accent font-mono"
            />
            {importErr && <p className="text-[10px] text-status-danger font-mono mt-1.5">ERROR: {importErr}</p>}
            <div className="flex justify-end gap-2 text-xs mt-3">
              <button 
                onClick={() => { setShowImportDialog(false); setImportErr(''); }}
                className="px-3 py-1.5 text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
              <button 
                onClick={handleImportSubmit}
                disabled={!importJson}
                className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-bg-primary font-bold rounded transition disabled:opacity-35"
              >
                Mount Layout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-down Theme Customizer Token Panel */}
      {showThemeBuilder && activeTheme === 'custom' && (
        <div className="bg-bg-primary border border-border-primary rounded-lg p-4 mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-fade-in shadow-inner">
          <div className="col-span-full border-b border-border-primary pb-1.5 mb-1.5 flex justify-between items-center">
            <span className="text-[10px] font-bold text-accent uppercase font-mono tracking-widest">Theme Token Brand customizer</span>
            <button onClick={() => setShowThemeBuilder(false)} className="text-[10px] text-text-muted hover:text-text-primary">Close</button>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-mono">PRIMARY BG</label>
            <input 
              type="color" 
              value={customColors.bgPrimary} 
              onChange={(e) => updateCustomColors({ bgPrimary: e.target.value })}
              className="bg-transparent border-0 cursor-pointer h-7 w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-mono">SECONDARY BG</label>
            <input 
              type="color" 
              value={customColors.bgSecondary} 
              onChange={(e) => updateCustomColors({ bgSecondary: e.target.value })}
              className="bg-transparent border-0 cursor-pointer h-7 w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-mono">ACCENT BRAND</label>
            <input 
              type="color" 
              value={customColors.accent} 
              onChange={(e) => updateCustomColors({ 
                accent: e.target.value,
                accentHover: e.target.value,
                accentMuted: `${e.target.value}40`
              })}
              className="bg-transparent border-0 cursor-pointer h-7 w-full"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-muted font-mono">BORDER CORE</label>
            <input 
              type="color" 
              value={customColors.borderPrimary} 
              onChange={(e) => updateCustomColors({ borderPrimary: e.target.value })}
              className="bg-transparent border-0 cursor-pointer h-7 w-full"
            />
          </div>
        </div>
      )}

      {/* Guided Onboarding Tour Modal */}
      {showTourModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-[200] animate-fade-in p-4 select-text">
          <div className="bg-bg-secondary border border-accent rounded-lg p-6 w-full max-w-md shadow-glow relative select-text">
            <button 
              onClick={() => setShowTourModal(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary text-xs font-mono font-bold"
            >
              CLOSE [X]
            </button>

            {/* Tour Headers */}
            <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-widest block mb-1">
              GUIDED ONBOARDING • STEP {tourStep + 1} OF 5
            </span>

            {/* Step 0 */}
            {tourStep === 0 && (
              <div className="animate-fade-in select-text">
                <h3 className="text-sm font-black text-text-primary font-sans uppercase mb-2">Welcome to Meridian Capital!</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-sans select-text">
                  We manage **USD 45 Billion** across global equities, sovereign bonds, and alternative holdings. This dashboard replicates institutional setups like **Bloomberg Terminal** and **Refinitiv Eikon** but includes a **🎓 Simple Mode** for anyone without a finance degree!
                </p>
                <div className="mt-4 p-3 bg-bg-primary border border-border-primary rounded text-[11px] text-text-muted leading-relaxed font-sans">
                  💡 **Pro-Tip**: Look for **(?) Helper Badges** next to complex terms inside simple mode to view direct plain-English translations!
                </div>
              </div>
            )}

            {/* Step 1 */}
            {tourStep === 1 && (
              <div className="animate-fade-in select-text">
                <h3 className="text-sm font-black text-text-primary font-sans uppercase mb-2">Curated Persona Layouts</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-sans select-text">
                  Use the **Layout Presets** selector to instantly reconfigure the dashboard for various portfolio manager roles:
                </p>
                <ul className="text-xs text-text-secondary font-sans list-disc list-inside mt-3 space-y-1.5 pl-1 select-text">
                  <li>**Arjun K. (Equities)**: Allocation pies, news feeds, and holdings tables.</li>
                  <li>**Sarah M. (Options)**: High-density alerts, VaR limits, and volatility matrices.</li>
                  <li>**Chen W. (Risk)**: Deep drawdown curves, correlations, and exposure treemaps.</li>
                </ul>
              </div>
            )}

            {/* Step 2 */}
            {tourStep === 2 && (
              <div className="animate-fade-in select-text">
                <h3 className="text-sm font-black text-text-primary font-sans uppercase mb-2">Live Feeds & Volatility</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-sans select-text">
                  Our simulator mimics live **WebSocket connections** and REST feeds with real-time price changes.
                </p>
                <div className="mt-3 p-3 bg-bg-primary border border-border-primary rounded text-[11px] text-text-muted leading-relaxed font-mono">
                  🔴 **Try it**: Click the **Pause** icon in the toolbar. Once frozen, watch how widgets automatically wrap in a **glowing amber border** to warn traders of stale pricing!
                </div>
              </div>
            )}

            {/* Step 3 */}
            {tourStep === 3 && (
              <div className="animate-fade-in select-text">
                <h3 className="text-sm font-black text-text-primary font-sans uppercase mb-2">Customise Your Canvas</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-sans select-text">
                  Select **Customize Canvas** to unlock editing capabilities. You can:
                </p>
                <ul className="text-xs text-text-secondary font-sans list-disc list-inside mt-3 space-y-1.5 pl-1 select-text">
                  <li>**Move & Resize**: Drag widget title bars or grab bottom-right corners.</li>
                  <li>**Catalog Sidebar**: Add new widget cards from a list of 12 catalog options.</li>
                  <li>**JSON Persistence**: Save custom layouts, export layouts under **4KB**, or upload JSON templates!</li>
                </ul>
              </div>
            )}

            {/* Step 4 */}
            {tourStep === 4 && (
              <div className="animate-fade-in select-text">
                <h3 className="text-sm font-black text-text-primary font-sans uppercase mb-2">White-Label Brand Builder</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-sans select-text">
                  Select different visual presets in the theme selector, or pick **🛠️ BRAND BUILDER** to dynamically adjust primary backgrounds, borders, and brand accents in real-time in **&lt;10ms**!
                </p>
                <div className="mt-4 p-3 bg-status-success/20 border border-status-success/40 text-status-success rounded text-[11px] font-sans font-bold text-center">
                  🎉 You are ready to manage USD 45 Billion!
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-border-primary/50 text-xs">
              <button
                disabled={tourStep === 0}
                onClick={() => setTourStep(prev => prev - 1)}
                className="px-3 py-1.5 rounded text-text-muted hover:text-text-primary disabled:opacity-20 transition"
              >
                Back
              </button>
              
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map(idx => (
                  <span 
                    key={idx} 
                    className={`w-2 h-2 rounded-full ${idx === tourStep ? 'bg-accent shadow-glow' : 'bg-border-primary'}`} 
                  />
                ))}
              </div>

              {tourStep < 4 ? (
                <button
                  onClick={() => setTourStep(prev => prev + 1)}
                  className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-bg-primary font-bold rounded transition"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setShowTourModal(false)}
                  className="px-4 py-1.5 bg-status-success hover:bg-status-success text-bg-primary font-bold rounded transition"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
export default DashboardHeader;
