import { useState, useEffect } from 'react';
import { wsSimulator } from '../data/websocketSimulator';
import { 
  generateCorrelationMatrix, 
  generateBrinsonAttribution, 
  generateExposureTreemap,
  generateNewsArticles,
  generateAlerts,
  generateNAVHistory,
  calculateDrawdowns
} from '../data/mockDataGenerator';

// Static/slow channels mock cache
let staticDataCache: Record<string, any> = {
  correlation: generateCorrelationMatrix(),
  brinson: generateBrinsonAttribution(),
  exposure: generateExposureTreemap(),
  news: generateNewsArticles(),
  alerts: generateAlerts(),
  navHistory: generateNAVHistory(252),
};

staticDataCache.drawdown = calculateDrawdowns(staticDataCache.navHistory);

export const useRealTimeData = <T>(channel: string, expectedIntervalMs: number) => {
  const [data, setData] = useState<T | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaticData = () => {
    try {
      setIsLoading(true);
      // Simulate slight network delay
      setTimeout(() => {
        let freshData;
        if (channel === 'correlation') {
          freshData = generateCorrelationMatrix();
        } else if (channel === 'brinson') {
          freshData = generateBrinsonAttribution();
        } else if (channel === 'exposure') {
          freshData = generateExposureTreemap();
        } else if (channel === 'news') {
          // Sometimes add a new article to news feed
          freshData = generateNewsArticles();
        } else if (channel === 'alerts') {
          freshData = generateAlerts();
        } else if (channel === 'drawdown') {
          const nav = generateNAVHistory(252);
          freshData = calculateDrawdowns(nav);
        } else if (channel === 'navHistory') {
          freshData = generateNAVHistory(252);
        } else {
          freshData = staticDataCache[channel] || null;
        }

        staticDataCache[channel] = freshData;
        setData(freshData as T);
        setLastUpdated(new Date());
        setIsStale(false);
        setIsLoading(false);
        setError(null);
      }, Math.random() * 200 + 50); // 50ms-250ms delay
    } catch (e: any) {
      setError(e.message || 'Failed to load portfolio analytics data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // If it's a real-time WebSocket channel
    if (channel === 'holdings' || channel === 'summary') {
      setIsLoading(true);
      const unsubscribe = wsSimulator.subscribe(channel, (updatedData) => {
        setData(updatedData as T);
        setLastUpdated(new Date());
        setIsStale(false);
        setIsLoading(false);
        setError(null);
      });
      return () => unsubscribe();
    } else {
      // If it's a polling / REST channel
      fetchStaticData();
      
      // Setup periodic polling interval
      const pollInterval = setInterval(() => {
        if (!wsSimulator.isPaused) {
          fetchStaticData();
        }
      }, expectedIntervalMs);

      return () => clearInterval(pollInterval);
    }
  }, [channel, expectedIntervalMs]);

  // Periodic check for data staleness
  useEffect(() => {
    if (!lastUpdated) return;

    const interval = setInterval(() => {
      const diff = Date.now() - lastUpdated.getTime();
      // If the simulator is paused or a packet is lost, check staleness
      if (diff > expectedIntervalMs * 2 || wsSimulator.isPaused) {
        setIsStale(true);
      } else {
        setIsStale(false);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [lastUpdated, expectedIntervalMs]);

  return { 
    data, 
    lastUpdated, 
    isStale, 
    isLoading, 
    error,
    refetch: fetchStaticData 
  };
};
