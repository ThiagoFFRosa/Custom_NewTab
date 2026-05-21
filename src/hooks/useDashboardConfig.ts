import { useState, useEffect, useRef } from 'react';
import { DashboardConfig } from '../types';
import { initialMockData } from '../data/mockData';
import { getConfig, resetConfig as resetConfigApi, saveConfig } from '../services/api';

const STORAGE_KEY = 'fuzzy_dashboard_config_v1';

export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>(initialMockData);
  const initialized = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const remote = await getConfig();
        setConfig(remote);
      } catch (e) {
        console.error('Falha ao carregar API, usando localStorage/default', e);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try { setConfig(JSON.parse(saved)); } catch {}
        }
      } finally {
        initialized.current = true;
      }
    })();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    if (!initialized.current) return;
    saveConfig(config).catch((e) => console.error('Falha ao salvar config na API', e));
  }, [config]);

  const updateConfig = (newConfig: Partial<DashboardConfig> | ((prev: DashboardConfig) => DashboardConfig)) => {
    setConfig((prev) => (typeof newConfig === 'function' ? newConfig(prev) : { ...prev, ...newConfig }));
  };

  const resetConfig = async () => {
    try {
      const reset = await resetConfigApi();
      setConfig(reset);
    } catch (e) {
      console.error('Falha ao resetar via API', e);
      localStorage.removeItem(STORAGE_KEY);
      setConfig(initialMockData);
    }
  };

  return { config, updateConfig, resetConfig };
}
