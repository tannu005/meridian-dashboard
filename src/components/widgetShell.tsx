import React, { Component, ErrorInfo, ReactNode, useState } from 'react';
import { 
  Settings, 
  X, 
  Maximize2, 
  Minimize2, 
  AlertTriangle, 
  RefreshCw, 
  Clock,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  ServerCrash,
  GripHorizontal
} from 'lucide-react';
import { WidgetDefinition, WidgetInstance } from '../types';
import { useDashboardStore } from '../store/dashboardStore';

// Custom Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class WidgetErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("WidgetErrorBoundary caught an error", error, errorInfo);
  }

  resetBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, this.resetBoundary);
    }
    return this.props.children;
  }
}

// Widget Shell Props
interface WidgetShellProps {
  instance: WidgetInstance;
  definition: WidgetDefinition;
  isLoading: boolean;
  isStale: boolean;
  lastUpdated: Date | null;
  error: string | null;
  refetch: () => void;
  children: ReactNode;
}

export const WidgetShell: React.FC<WidgetShellProps> = ({
  instance,
  definition,
  isLoading,
  isStale,
  lastUpdated,
  error,
  refetch,
  children
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const isSimpleMode = useDashboardStore((state) => state.isSimpleMode);

  // Removed progressive disclosure auto-collapse to prevent empty widget confusion
  
  React.useEffect(() => {
    if (lastUpdated) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 600);
      return () => clearTimeout(timer);
    }
  }, [lastUpdated]);

  const removeWidget = useDashboardStore((state) => state.removeWidget);
  const updateWidgetConfig = useDashboardStore((state) => state.updateWidgetConfig);
  const isEditing = useDashboardStore((state) => state.isEditing);

  const formatLastUpdated = (date: Date | null) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString([], { hour12: false });
  };

  const handleConfigChange = (key: string, value: any) => {
    updateWidgetConfig(instance.id, { [key]: value });
  };

  // Premium Fallback UI for failed widget renders
  const renderErrorFallback = (err: Error, reset: () => void) => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-bg-secondary/40 border border-status-danger/30 rounded-lg relative overflow-hidden group">
      <div className="absolute inset-0 bg-status-danger/5 opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative z-10 flex flex-col items-center">
        <div className="p-3 bg-status-danger/10 rounded-full mb-3 shadow-[0_0_15px_rgba(251,113,133,0.2)]">
          <ServerCrash className="w-8 h-8 text-status-danger animate-pulse" />
        </div>
        <h4 className="text-sm font-bold text-text-primary mb-1 uppercase tracking-wide">Telemetry Disrupted</h4>
        <p className="text-xs text-text-muted mb-4 max-w-[200px] leading-relaxed truncate" title={err.message}>
          {err.message || "Data feed connection lost"}
        </p>
        <button 
          onClick={() => { reset(); refetch(); }}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] uppercase tracking-wider font-bold bg-bg-primary hover:bg-status-danger/20 border border-status-danger/50 text-status-danger rounded transition-all duration-300 shadow-sm hover:shadow-[0_0_10px_rgba(251,113,133,0.3)] focus:outline-none focus:ring-1 focus:ring-status-danger"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Re-establish Link
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className={`
        flex flex-col h-full bg-bg-secondary border rounded-lg shadow-panel overflow-hidden transition-all duration-200
        ${isStale ? 'border-status-warning shadow-glow-warning animate-pulse-subtle' : isFlashing ? 'border-status-success/60 shadow-[0_0_8px_var(--color-success)]' : 'border-border-primary'}
        ${isExpanded ? 'fixed inset-4 z-[100] bg-bg-secondary shadow-2xl' : ''}
      `}
      style={isExpanded ? { height: 'calc(100vh - 32px)', width: 'calc(100vw - 32px)' } : {}}
      role="region"
      aria-label={`${definition.name} widget`}
    >
      {/* Widget Header */}
      <div className={`flex items-center justify-between px-3 py-2 bg-bg-tertiary border-b border-border-primary select-none drag-handle transition-colors ${isEditing ? 'cursor-grab active:cursor-grabbing hover:bg-border-primary/50' : ''}`}>
        <div className="flex items-center gap-2 min-w-0">
          {isEditing && (
            <GripHorizontal className="w-3.5 h-3.5 text-text-muted/50 hidden md:block group-hover:text-text-muted transition-colors flex-shrink-0" />
          )}
          <definition.icon className="w-4 h-4 text-accent flex-shrink-0" />
          <h3 className="text-xs font-bold text-text-primary truncate font-sans tracking-wide">
            {definition.name}
            {isStale && <span className="ml-2 text-[10px] text-status-warning font-mono">[STALE]</span>}
          </h3>
          {isSimpleMode && (
            <div className="group relative ml-1 flex items-center">
              <HelpCircle className="w-3.5 h-3.5 text-accent cursor-help" />
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 hidden group-hover:block w-48 p-2 bg-bg-primary border border-accent rounded text-[10px] text-text-primary shadow-glow z-[200] font-sans font-normal normal-case whitespace-normal text-center">
                {definition.description}
              </div>
            </div>
          )}
          <span className="hidden md:inline text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-bg-primary text-text-muted border border-border-primary">
            {definition.category}
          </span>
        </div>
        
        {/* Widget Toolbar */}
        <div className="flex items-center gap-1.5 ml-2">
          {lastUpdated && (
            <div className="flex items-center gap-1 text-[10px] text-text-muted font-mono" title={`Expected refresh: every ${definition.dataSource.intervalMs/1000}s`}>
              <Clock className="w-2.5 h-2.5" />
              <span>{formatLastUpdated(lastUpdated)}</span>
            </div>
          )}
          
          {/* Collapse button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-primary transition focus:ring-2 focus:ring-accent focus:outline-none"
            title={isCollapsed ? 'Expand Widget Content' : 'Collapse Widget Content'}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {/* Settings button */}
          {Object.keys(definition.configSchema).length > 0 && (
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className={`p-1 rounded text-text-muted hover:text-text-primary transition ${showConfig ? 'bg-bg-primary text-accent' : 'hover:bg-bg-primary'} focus:ring-2 focus:ring-accent focus:outline-none`}
              title="Widget Settings"
              aria-expanded={showConfig}
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Fullscreen button */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-primary transition focus:ring-2 focus:ring-accent focus:outline-none"
            title={isExpanded ? 'Minimize Widget' : 'Maximize Widget'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close/Remove button */}
          {isEditing && (
            <button 
              onClick={() => removeWidget(instance.id)}
              className="p-1 rounded text-text-muted hover:text-status-danger hover:bg-bg-primary transition focus:ring-2 focus:ring-accent focus:outline-none"
              title="Remove Widget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Widget Body Area */}
      {!isCollapsed && (
        <div className="flex-1 relative p-3 overflow-hidden min-h-0 bg-bg-secondary">
          {/* Config Overlay Panel */}
          {showConfig && (
            <div className="absolute inset-0 bg-bg-primary/95 border-b border-border-primary p-4 z-40 overflow-y-auto animate-fade-in">
              <div className="flex items-center justify-between mb-3 border-b border-border-primary pb-2">
                <h4 className="text-xs font-bold text-accent uppercase tracking-wider font-mono">Widget Settings</h4>
                <button 
                  onClick={() => setShowConfig(false)}
                  className="text-text-muted hover:text-text-primary text-xs"
                >
                  Done
                </button>
              </div>
              
              {/* Dynamic Settings Form */}
              <div className="space-y-3">
                {Object.entries(definition.configSchema).map(([key, schema]) => {
                  const val = instance.config[key] !== undefined ? instance.config[key] : definition.defaultConfig[key];
                  
                  return (
                    <div key={key} className="flex flex-col gap-1">
                      <label className="text-[11px] text-text-secondary font-medium font-sans">
                        {schema.label}
                      </label>
                      {schema.type === 'select' && (
                        <select 
                          value={val}
                          onChange={(e) => handleConfigChange(key, e.target.value)}
                          className="w-full bg-bg-secondary border border-border-primary rounded px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent"
                        >
                          {schema.options.map((opt: string | number) => (
                            <option key={opt} value={opt}>{opt.toString().toUpperCase()}</option>
                          ))}
                        </select>
                      )}
                      {schema.type === 'boolean' && (
                        <label className="flex items-center gap-2 cursor-pointer mt-1">
                          <input 
                            type="checkbox"
                            checked={!!val}
                            onChange={(e) => handleConfigChange(key, e.target.checked)}
                            className="rounded bg-bg-secondary border border-border-primary text-accent focus:ring-accent"
                          />
                          <span className="text-[11px] text-text-muted font-sans select-none">Enable</span>
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Loading Shimmer Skeleton */}
          {isLoading ? (
            <div className="flex flex-col h-full gap-2">
              <div className="h-5 w-1/3 skeleton-shimmer rounded" />
              <div className="flex-1 skeleton-shimmer rounded" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-status-warning mb-2" />
              <h4 className="text-sm font-semibold text-text-primary mb-1">Data Load Error</h4>
              <p className="text-xs text-text-muted mb-3">{error}</p>
              <button 
                onClick={refetch}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-bg-tertiary hover:bg-border-primary border border-border-primary text-text-primary rounded transition font-medium"
              >
                <RefreshCw className="w-3 h-3" /> Retry Connection
              </button>
            </div>
          ) : (
            /* Error boundary wrap around widget children */
            <WidgetErrorBoundary fallback={renderErrorFallback}>
              {children}
            </WidgetErrorBoundary>
          )}
        </div>
      )}
    </div>
  );
};
export default WidgetShell;
