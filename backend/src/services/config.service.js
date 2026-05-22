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

export async function getConfig() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    const parsed = JSON.parse(content);
    if (validateConfig(parsed)) return parsed;
    throw new Error('Invalid config');
  } catch {
    const fallback = JSON.parse(await fs.readFile(defaultPath, 'utf-8'));
    await safeJsonWrite(configPath, fallback, { backupPath, historyDir });
    return fallback;
  }
}

export async function saveConfig(config) {
  if (!validateConfig(config)) throw new Error('Config inválida');
  await safeJsonWrite(configPath, config, { backupPath, historyDir, maxHistory: 20 });
  return config;
}

export async function resetConfig() {
  const fallback = JSON.parse(await fs.readFile(defaultPath, 'utf-8'));
  await safeJsonWrite(configPath, fallback, { backupPath, historyDir, maxHistory: 20 });
  return fallback;
}
