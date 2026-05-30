import { MockHolding } from '../types';
import { generateHoldings, recalculateHoldings, generateSummary } from './mockDataGenerator';

type MessageCallback = (data: any) => void;

class WebSocketSimulator {
  private listeners: Record<string, Set<MessageCallback>> = {};
  private intervalId: any = null;
  private currentHoldings: MockHolding[] = [];
  
  // Controls
  public intervalMs = 2000; // default 2s refresh
  public latencyMs = 80;    // default 80ms latency
  public isPaused = false;
  public connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'connected';
  
  constructor() {
    this.currentHoldings = generateHoldings();
    this.startStreaming();
  }
  
  public getHoldings(): MockHolding[] {
    return [...this.currentHoldings];
  }
  
  public getSummary() {
    return generateSummary(this.currentHoldings);
  }
  
  public setRefreshRate(seconds: number) {
    this.intervalMs = seconds * 1000;
    this.restartStreaming();
  }
  
  public setLatency(ms: number) {
    this.latencyMs = ms;
  }
  
  public triggerPause(paused: boolean) {
    this.isPaused = paused;
    this.broadcast('status', { status: paused ? 'paused' : 'connected' });
  }
  
  public triggerDisconnect() {
    this.connectionStatus = 'disconnected';
    this.broadcast('status', { status: 'disconnected' });
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  public triggerReconnect() {
    this.connectionStatus = 'connecting';
    this.broadcast('status', { status: 'connecting' });
    
    setTimeout(() => {
      this.connectionStatus = 'connected';
      this.broadcast('status', { status: 'connected' });
      this.startStreaming();
    }, 1000);
  }
  
  public subscribe(channel: string, callback: MessageCallback) {
    if (!this.listeners[channel]) {
      this.listeners[channel] = new Set();
    }
    this.listeners[channel].add(callback);
    
    // Immediately send initial state
    setTimeout(() => {
      if (channel === 'holdings') {
        callback(this.getHoldings());
      } else if (channel === 'summary') {
        callback(this.getSummary());
      }
    }, 50);
    
    return () => {
      this.listeners[channel]?.delete(callback);
    };
  }
  
  private startStreaming() {
    if (this.intervalId) clearInterval(this.intervalId);
    
    this.intervalId = setInterval(() => {
      if (this.isPaused || this.connectionStatus !== 'connected') return;
      
      // Update holding prices slightly
      this.currentHoldings = this.currentHoldings.map((h) => {
        // High frequency changes: -0.5% to +0.6%
        const changePercent = (Math.random() - 0.48) * 1.2;
        const newPrice = Math.max(1, h.price * (1 + changePercent / 100));
        
        return {
          ...h,
          price: parseFloat(newPrice.toFixed(2)),
          dailyPnLPercent: parseFloat((h.dailyPnLPercent + changePercent).toFixed(2))
        };
      });
      
      recalculateHoldings(this.currentHoldings);
      
      // Inject simulated latency before broadcasting
      setTimeout(() => {
        this.broadcast('holdings', this.getHoldings());
        this.broadcast('summary', this.getSummary());
      }, this.latencyMs);
      
    }, this.intervalMs);
  }
  
  private restartStreaming() {
    this.startStreaming();
  }
  
  private broadcast(channel: string, data: any) {
    const list = this.listeners[channel];
    if (list) {
      list.forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in WebSocket subscriber for channel "${channel}":`, e);
        }
      });
    }
  }
}

export const wsSimulator = new WebSocketSimulator();
export default wsSimulator;
