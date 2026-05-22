import { useState, useEffect, useRef } from 'react';
import { DashboardConfig } from '../types';
import { initialMockData } from '../data/mockData';
import { getConfig, resetConfig as resetConfigApi, saveConfig } from '../services/api';

const STORAGE_KEY = 'fuzzy_dashboard_config_v1';

function normalizeConfig(config: DashboardConfig): DashboardConfig {
  const wallpapers = Array.isArray(config.wallpapers)
    ? config.wallpapers.map((w) => ({ ...w, enabledForSlideshow: w.enabledForSlideshow !== false }))
    : [];
  const appearance = config.settings?.appearance || ({} as DashboardConfig['settings']['appearance']);
  return {
    ...config,
    wallpapers,
    settings: {
      ...config.settings,
      appearance: {
        ...appearance,
        backgroundColor: appearance.backgroundColor || '#050505',
        overlayColor: appearance.overlayColor || '#000000',
        accentColor: appearance.accentColor || '#ffffff',
        slideshow: {
          enabled: false,
          intervalMs: 60000,
          mode: 'random',
          includeUploaded: true,
          includeRemoteUrls: true,
          ...(appearance.slideshow || {})
        }
      }
    }
  };
}

export function useDashboardConfig() {
  const [config, setConfig] = useState<DashboardConfig>(normalizeConfig(initialMockData));
  const initialized = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const remote = await getConfig();
        setConfig(normalizeConfig(remote));
      } catch (e) {
        console.error('Falha ao carregar API, usando localStorage/default', e);
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try { setConfig(normalizeConfig(JSON.parse(saved))); } catch {}
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
    setConfig((prev) => normalizeConfig(typeof newConfig === 'function' ? newConfig(prev) : { ...prev, ...newConfig } as DashboardConfig));
  };

  const resetConfig = async () => {
    try {
      const reset = await resetConfigApi();
      setConfig(normalizeConfig(reset));
    } catch (e) {
      console.error('Falha ao resetar via API', e);
      localStorage.removeItem(STORAGE_KEY);
      setConfig(normalizeConfig(initialMockData));
    }
  };

  return { config, updateConfig, resetConfig };
}
