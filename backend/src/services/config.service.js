import fs from 'fs/promises';
import path from 'path';
import { safeJsonWrite } from '../utils/safeJsonWrite.js';

import { DATA_DIR } from '../paths.js';

const dataDir = DATA_DIR;
const configPath = path.join(dataDir, 'config.json');
const defaultPath = path.join(dataDir, 'default-config.json');
const backupPath = path.join(dataDir, 'config.backup.json');
const historyDir = path.join(dataDir, 'history');

function validateConfig(config) {
  if (!config || typeof config !== 'object') return false;
  const required = ['settings', 'categories', 'shortcuts', 'widgets'];
  return required.every((k) => k in config);
}

function normalizeWallpaper(wallpaper) {
  if (!wallpaper || typeof wallpaper !== 'object') return null;
  return {
    ...wallpaper,
    enabledForSlideshow: wallpaper.enabledForSlideshow !== false
  };
}

export function normalizeConfigShape(config) {
  const next = { ...config };
  next.wallpapers = Array.isArray(next.wallpapers) ? next.wallpapers.map(normalizeWallpaper).filter(Boolean) : [];
  next.settings = next.settings || {};
  next.settings.appearance = next.settings.appearance || {};
  const appearance = next.settings.appearance;
  appearance.backgroundColor = appearance.backgroundColor || '#050505';
  appearance.overlayColor = appearance.overlayColor || '#000000';
  appearance.accentColor = appearance.accentColor || '#ffffff';
  appearance.overlayOpacity = typeof appearance.overlayOpacity === 'number' ? appearance.overlayOpacity : 0.65;
  appearance.slideshow = {
    enabled: false,
    intervalMs: 60000,
    mode: 'random',
    includeUploaded: true,
    includeRemoteUrls: true,
    ...(appearance.slideshow || {})
  };
  return next;
}

export async function getConfig() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const parsed = JSON.parse(content);
    if (validateConfig(parsed)) return normalizeConfigShape(parsed);
    throw new Error('Invalid config');
  } catch {
    const fallback = JSON.parse(await fs.readFile(defaultPath, 'utf-8'));
    await safeJsonWrite(configPath, fallback, { backupPath, historyDir });
    return normalizeConfigShape(fallback);
  }
}

export async function saveConfig(config) {
  if (!validateConfig(config)) throw new Error('Config inválida');
  const normalized = normalizeConfigShape(config);
  await safeJsonWrite(configPath, normalized, { backupPath, historyDir, maxHistory: 20 });
  return normalized;
}

export async function resetConfig() {
  const fallback = JSON.parse(await fs.readFile(defaultPath, 'utf-8'));
  await safeJsonWrite(configPath, fallback, { backupPath, historyDir, maxHistory: 20 });
  return fallback;
}
