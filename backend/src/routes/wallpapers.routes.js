import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { getConfig, normalizeConfigShape, saveConfig } from '../services/config.service.js';

import { UPLOADS_DIR } from '../paths.js';

const router = express.Router();
const backgroundsDir = path.join(UPLOADS_DIR, 'backgrounds');

const isValidHttpUrl = (value) => {
  try { const u = new URL(value); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
};
const id = () => `wallpaper_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function normalizeConfig(config) {
  return normalizeConfigShape(config);
}

router.get('/', async (_req, res) => {
  const config = normalizeConfig(await getConfig());
  res.json(config.wallpapers);
});

router.post('/url', async (req, res) => {
  const urls = Array.isArray(req.body?.urls) ? req.body.urls : [];
  const valid = [];
  const invalid = [];
  for (const raw of urls) {
    const url = String(raw || '').trim();
    if (!url) continue;
    if (!isValidHttpUrl(url)) { invalid.push(url); continue; }
    valid.push({ id: id(), type: 'url', name: url.split('/').pop() || 'Remote Wallpaper', url, source: 'remote', enabledForSlideshow: true, createdAt: new Date().toISOString() });
  }
  const config = normalizeConfig(await getConfig());
  config.wallpapers.push(...valid);
  await saveConfig(config);
  res.json({ ok: true, added: valid, invalid });
});

router.put('/:id', async (req, res) => {
  const config = normalizeConfig(await getConfig());
  const wallpaper = config.wallpapers.find((w) => w.id === req.params.id);
  if (!wallpaper) return res.status(404).json({ error: 'Wallpaper não encontrado' });

  if (typeof req.body?.enabledForSlideshow === 'boolean') {
    wallpaper.enabledForSlideshow = req.body.enabledForSlideshow;
  }
  if (typeof req.body?.name === 'string' && req.body.name.trim()) {
    wallpaper.name = req.body.name.trim();
  }

  await saveConfig(config);
  res.json({ ok: true, wallpaper });
});

router.post('/:id/use', async (req, res) => {
  const config = normalizeConfig(await getConfig());
  const wallpaper = config.wallpapers.find((w) => w.id === req.params.id);
  if (!wallpaper) return res.status(404).json({ error: 'Wallpaper não encontrado' });
  config.settings.appearance.activeWallpaperId = wallpaper.id;
  config.settings.appearance.backgroundUrl = wallpaper.url;
  config.settings.appearance.backgroundType = 'url';
  const saved = await saveConfig(config);
  res.json(saved);
});

router.delete('/:id', async (req, res) => {
  const config = normalizeConfig(await getConfig());
  const target = config.wallpapers.find((w) => w.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'Wallpaper não encontrado' });
  if (target.type === 'upload' && target.filename) {
    const filePath = path.join(backgroundsDir, path.basename(target.filename));
    if (filePath.startsWith(backgroundsDir)) await fs.unlink(filePath).catch(() => {});
  }
  config.wallpapers = config.wallpapers.filter((w) => w.id !== req.params.id);
  if (config.settings.appearance.activeWallpaperId === req.params.id) {
    const next = config.wallpapers[0];
    config.settings.appearance.activeWallpaperId = next?.id || '';
    config.settings.appearance.backgroundUrl = next?.url || '';
    if (!next) config.settings.appearance.backgroundType = 'color';
  }
  await saveConfig(config);
  res.json({ ok: true });
});

router.post('/delete-many', async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const config = normalizeConfig(await getConfig());
  const deleting = new Set(ids);
  await Promise.all(config.wallpapers.filter((w) => deleting.has(w.id) && w.type === 'upload' && w.filename).map((w) => {
    const filePath = path.join(backgroundsDir, path.basename(w.filename));
    if (!filePath.startsWith(backgroundsDir)) return Promise.resolve();
    return fs.unlink(filePath).catch(() => {});
  }));
  config.wallpapers = config.wallpapers.filter((w) => !deleting.has(w.id));
  if (deleting.has(config.settings.appearance.activeWallpaperId)) {
    const next = config.wallpapers[0];
    config.settings.appearance.activeWallpaperId = next?.id || '';
    config.settings.appearance.backgroundUrl = next?.url || '';
    if (!next) config.settings.appearance.backgroundType = 'color';
  }
  await saveConfig(config);
  res.json({ ok: true });
});

export default router;
