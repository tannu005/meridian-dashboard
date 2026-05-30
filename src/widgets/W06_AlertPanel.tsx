import React, { useState, useMemo } from 'react';
import { WidgetComponentProps, AlertNotification } from '../types';
import { AlertOctagon, AlertTriangle, Info, BellOff, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const W06_AlertPanel: React.FC<WidgetComponentProps<any, AlertNotification[]>> = ({
  data,
  config,
}) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [snoozedAlerts, setSnoozedAlerts] = useState<Record<string, number>>({}); // id -> epoch

  const minSeverity = config.minSeverity || 'info';

  const severityWeight = (sev: string) => {
    switch (sev) {
      case 'critical': return 3;
      case 'warning': return 2;
      default: return 1;
    }
  };

  const handleDismiss = (id: string) => {
    setDismissedAlerts(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleSnooze = (id: string, minutes: number) => {
    const until = Date.now() + minutes * 60 * 1000;
    setSnoozedAlerts(prev => ({
      ...prev,
      [id]: until
    }));
  };

  const activeAlerts = useMemo(() => {
    if (!data) return [];
    const minWeight = severityWeight(minSeverity);
    const now = Date.now();

    return data
      .filter((alert) => {
        if (dismissedAlerts.has(alert.id)) return false;
        
        // Check if snoozed
        const snoozeLimit = snoozedAlerts[alert.id];
        if (snoozeLimit && snoozeLimit > now) return false;
        
        // Check minimum severity level
        return severityWeight(alert.severity) >= minWeight;
      })
      .sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity));
  }, [data, dismissedAlerts, snoozedAlerts, minSeverity]);

  const renderIcon = (severity: AlertNotification['severity']) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="w-4 h-4 text-status-danger animate-pulse flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-status-warning flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-status-info flex-shrink-0" />;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-text-muted">
        No active alert feeds.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-secondary text-text-primary">
      {/* Active Alerts List */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {activeAlerts.map((alert) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              key={alert.id}
              className={`
                flex items-start gap-2.5 p-2.5 rounded border select-text
                ${alert.severity === 'critical' ? 'border-status-danger/40 bg-status-danger/5 shadow-glow-danger' : ''}
                ${alert.severity === 'warning' ? 'border-status-warning/30 bg-status-warning/5' : ''}
                ${alert.severity === 'info' ? 'border-status-info/20 bg-status-info/5' : ''}
              `}
            >
              {renderIcon(alert.severity)}
              
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-sans font-medium leading-normal text-text-primary select-text">
                  {alert.message}
                </p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[9px] font-mono text-text-muted">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                  
                  {/* Snoozing options */}
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={() => handleSnooze(alert.id, 15)}
                      className="text-[9px] font-mono font-bold text-text-muted hover:text-accent transition uppercase"
                      title="Snooze 15 min"
                    >
                      SNOOZE 15M
                    </button>
                    <span className="text-text-muted text-[8px]">•</span>
                    <button 
                      onClick={() => handleSnooze(alert.id, 60)}
                      className="text-[9px] font-mono font-bold text-text-muted hover:text-accent transition uppercase"
                      title="Snooze 1 hour"
                    >
                      1H
                    </button>
                  </div>
                </div>
              </div>

              {/* Dismiss Action button */}
              <button 
                onClick={() => handleDismiss(alert.id)}
                className="text-text-muted hover:text-text-primary p-0.5 rounded transition flex-shrink-0"
                title="Dismiss Alert"
              >
                <CheckCircle className="w-4.5 h-4.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {activeAlerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 text-center text-text-muted">
            <BellOff className="w-6 h-6 text-status-success/60 mb-1" />
            <span className="text-[11px] font-sans text-status-success font-semibold">Zero limit breaks / alert events.</span>
            <span className="text-[9px] font-mono text-text-muted mt-0.5">All portfolio risk filters are clear.</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default W06_AlertPanel;
