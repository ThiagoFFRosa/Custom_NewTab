import { useState, useEffect } from 'react';
import { DashboardConfig } from '../types';
import { initialMockData } from '../data/mockData';

const STORAGE_KEY = 'fuzzy_dashboard_config_v1';

export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
    return initialMockData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateConfig = (newConfig: Partial<DashboardConfig> | ((prev: DashboardConfig) => DashboardConfig)) => {
    setConfig(prev => {
      if (typeof newConfig === 'function') {
        return newConfig(prev);
      }
      return { ...prev, ...newConfig };
    });
  };

  const resetConfig = () => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(initialMockData);
  };

  return { config, updateConfig, resetConfig };
}
