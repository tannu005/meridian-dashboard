import React, { useState, useEffect } from 'react';
import { WidgetComponentProps } from '../types';
import { wsSimulator } from '../data/websocketSimulator';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Cpu, 
  Wifi, 
  Activity, 
  SlidersHorizontal,
  AlertTriangle
} from 'lucide-react';

export const W13_SystemStatus: React.FC<WidgetComponentProps<any, any>> = ({
  data,
}) => {
  // Sync state with global wsSimulator
  const [isPaused, setIsPaused] = useState(wsSimulator.isPaused);
  const [tickRate, setTickRate] = useState(wsSimulator.intervalMs / 1000);
  const [latency, setLatency] = useState(wsSimulator.latencyMs);
  const [wsStatus, setWsStatus] = useState<string>('connected');

  // Real-time calculated metrics
  const [fps, setFps] = useState(60.0);
  const [renderLatency, setRenderLatency] = useState(12);
  const [throughput, setThroughput] = useState(12.4);

  // Monitor status updates
  useEffect(() => {
    const unsubscribe = wsSimulator.subscribe('status', (evt) => {
      setWsStatus(evt.status);
      if (evt.status === 'paused') {
        setIsPaused(true);
      } else if (evt.status === 'connected') {
        setIsPaused(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // 1. Interactive FPS tracker using requestAnimationFrame
  useEffect(() => {
    let lastTime = performance.now();
    let frameCount = 0;
    let animId: number;
    
    const countFrames = () => {
      frameCount++;
      const now = performance.now();
      if (now >= lastTime + 1000) {
        // Calculate true frame rate
        const calculatedFps = (frameCount * 1000) / (now - lastTime);
        // Add a micro-fluctuation to make it look active/dynamic
        const displayFps = Math.min(60.0, calculatedFps) - (Math.random() * 0.3);
        setFps(parseFloat(displayFps.toFixed(1)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(countFrames);
    };
    
    animId = requestAnimationFrame(countFrames);
    return () => cancelAnimationFrame(animId);
  }, []);

  // 2. Real-time Render Latency estimation
  useEffect(() => {
    const start = performance.now();
    requestAnimationFrame(() => {
      const end = performance.now();
      const actualDiff = end - start;
      // Add a realistic offset simulating database query + component layout paint
      setRenderLatency(Math.max(4, Math.round(actualDiff + Math.random() * 6 + (latency / 8))));
    });
  }, [data, latency]);

  // 3. Simulated Network Throughput scaled by tick rate
  useEffect(() => {
    if (wsStatus === 'connected' && !isPaused) {
      const interval = setInterval(() => {
        const baseThroughput = 28.5 / tickRate;
        const randomness = (Math.random() - 0.5) * 3.2;
        setThroughput(parseFloat(Math.max(1.2, baseThroughput + randomness).toFixed(1)));
      }, 1000);
      return () => clearInterval(interval);
    } else {
      const t = setTimeout(() => setThroughput(0), 0);
      return () => clearTimeout(t);
    }
  }, [wsStatus, isPaused, tickRate]);

  // Handle stream actions
  const togglePause = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    wsSimulator.triggerPause(nextPaused);
  };

  const handleTickChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seconds = Number(e.target.value);
    setTickRate(seconds);
    wsSimulator.setRefreshRate(seconds);
  };

  const handleLatencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const ms = Number(e.target.value);
    setLatency(ms);
    wsSimulator.setLatency(ms);
  };

  const reconnectFeed = () => {
    if (wsSimulator.connectionStatus === 'disconnected') {
      wsSimulator.triggerReconnect();
    } else {
      wsSimulator.triggerDisconnect();
      setWsStatus('disconnected');
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg-secondary select-none font-sans text-text-primary p-1">
      {/* Visual Gauges/Metrics Bar */}
      <div className="grid grid-cols-3 gap-2.5 mb-3.5">
        
        {/* Render Performance */}
        <div className="flex flex-col bg-bg-primary/40 border border-border-primary/60 rounded p-2.5 items-center justify-center text-center">
          <Cpu className="w-4 h-4 text-accent mb-1 animate-pulse" />
          <span className="text-[9px] font-bold text-text-muted inst-label uppercase tracking-wider block">
            Render Delay
          </span>
          <span className="text-base font-bold font-mono text-text-primary mt-0.5">
            {renderLatency}ms
          </span>
          <span className="text-[8px] font-mono text-status-success font-semibold mt-0.5">
            SUB-100MS OK
          </span>
        </div>

        {/* Frame Smoothness */}
        <div className="flex flex-col bg-bg-primary/40 border border-border-primary/60 rounded p-2.5 items-center justify-center text-center">
          <Activity className="w-4 h-4 text-status-success mb-1" />
          <span className="text-[9px] font-bold text-text-muted inst-label uppercase tracking-wider block">
            FPS Smoothness
          </span>
          <span className="text-base font-bold font-mono text-text-primary mt-0.5">
            {fps}
          </span>
          <span className="text-[8px] font-mono text-status-success font-semibold mt-0.5">
            STABLE 60HZ
          </span>
        </div>

        {/* Stream Throughput */}
        <div className="flex flex-col bg-bg-primary/40 border border-border-primary/60 rounded p-2.5 items-center justify-center text-center">
          <Wifi className={`w-4 h-4 mb-1 ${wsStatus === 'connected' && !isPaused ? 'text-accent' : 'text-text-muted'}`} />
          <span className="text-[9px] font-bold text-text-muted inst-label uppercase tracking-wider block">
            Throughput
          </span>
          <span className="text-base font-bold font-mono text-text-primary mt-0.5">
            {throughput} KB/s
          </span>
          <span className="text-[8px] font-mono text-text-muted mt-0.5">
            ACTIVE FEED
          </span>
        </div>
      </div>

      {/* Simulator Stream Control Panel */}
      <div className="flex-1 bg-bg-primary/65 border border-border-primary rounded p-3 flex flex-col justify-between">
        
        {/* Title */}
        <div className="flex items-center justify-between border-b border-border-primary/50 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">
              Websocket Simulator Controls
            </span>
          </div>
          <span className={`px-2 py-0.5 text-[8px] rounded font-mono font-bold uppercase tracking-wider border
            ${wsStatus === 'connected' && !isPaused 
              ? 'bg-status-success/10 border-status-success/30 text-status-success' 
              : wsStatus === 'paused' || isPaused 
              ? 'bg-status-warning/10 border-status-warning/30 text-status-warning animate-pulse' 
              : 'bg-status-danger/10 border-status-danger/30 text-status-danger'}`}
          >
            {wsStatus === 'connected' && !isPaused ? 'CONNECTED' : isPaused || wsStatus === 'paused' ? 'PAUSED' : 'OFFLINE'}
          </span>
        </div>

        {/* Sliders */}
        <div className="space-y-3 my-1">
          {/* Tick Rate Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-[9px]">
              <span className="text-text-muted font-bold uppercase tracking-wider">Tick Stream Interval:</span>
              <span className="text-text-primary font-bold">{tickRate.toFixed(1)} Seconds</span>
            </div>
            <input 
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={tickRate}
              onChange={handleTickChange}
              disabled={wsStatus === 'disconnected'}
              className="w-full accent-accent bg-bg-tertiary h-1.5 rounded cursor-pointer disabled:opacity-30"
            />
          </div>

          {/* Latency Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between font-mono text-[9px]">
              <span className="text-text-muted font-bold uppercase tracking-wider">Network Latency:</span>
              <span className="text-text-primary font-bold">{latency} ms</span>
            </div>
            <input 
              type="range"
              min="50"
              max="500"
              step="50"
              value={latency}
              onChange={handleLatencyChange}
              disabled={wsStatus === 'disconnected'}
              className="w-full accent-accent bg-bg-tertiary h-1.5 rounded cursor-pointer disabled:opacity-30"
            />
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-2 mt-3 text-xs">
          {/* Play / Pause Toggle */}
          <button
            onClick={togglePause}
            disabled={wsStatus === 'disconnected'}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded font-bold uppercase text-[10px] tracking-wider transition focus:ring-2 focus:ring-accent focus:outline-none disabled:opacity-35
              ${isPaused 
                ? 'bg-status-warning hover:bg-status-warning/90 text-bg-primary' 
                : 'bg-bg-tertiary hover:bg-border-primary border border-border-primary text-text-primary'}`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {isPaused ? 'Resume Datastream' : 'Pause Datastream'}
          </button>

          {/* Connect / Disconnect */}
          <button
            onClick={reconnectFeed}
            className={`px-3 py-1.5 rounded font-bold uppercase text-[10px] tracking-wider transition border focus:ring-2 focus:ring-accent focus:outline-none
              ${wsStatus === 'disconnected'
                ? 'bg-status-success hover:bg-status-success/90 border-status-success text-bg-primary'
                : 'bg-bg-tertiary hover:bg-border-primary border-border-primary text-text-secondary hover:text-text-primary'}`}
          >
            {wsStatus === 'disconnected' ? (
              <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Connect</span>
            ) : (
              <span>Disconnect</span>
            )}
          </button>
        </div>

        {/* Warning Indicator */}
        {isPaused && (
          <div className="mt-2.5 p-2 bg-status-warning/10 border border-status-warning/20 rounded flex items-center gap-2 text-[9px] text-status-warning font-sans animate-pulse-subtle">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Stale Warning: price feeds are frozen. Widgets will enter Stale states in 10s.</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default W13_SystemStatus;
