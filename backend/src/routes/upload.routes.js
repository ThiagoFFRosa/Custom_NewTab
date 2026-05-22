import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { getSafeFileName, isAllowedMime } from '../utils/fileName.js';
import { deleteUpload, listUploads, toUploadMeta } from '../services/upload.service.js';
import { getConfig, saveConfig } from '../services/config.service.js';
import { UPLOADS_DIR } from '../paths.js';

const router = express.Router();

function createStorage(folder, label) {
  return multer({
    storage: multer.diskStorage({
      destination: async (_req, _file, cb) => {
        const dir = path.join(UPLOADS_DIR, folder);
        await fs.mkdir(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (_req, file, cb) => {
        try { cb(null, getSafeFileName(label, file.originalname)); } catch (e) { cb(e); }
      }
    }),
    limits: { fileSize: label === 'background' ? 10 * 1024 * 1024 : 2 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => cb(null, isAllowedMime(file.mimetype))
  });
}

const bgUploadSingle = createStorage('backgrounds', 'background').single('file');
const bgUploadMany = createStorage('backgrounds', 'background').array('files', 20);
const iconUpload = createStorage('icons', 'icon').single('file');

router.post('/background', (req, res) => bgUploadSingle(req, res, async (err) => {
  if (err) return res.status(400).json({ error: err.message });
  const meta = toUploadMeta('background', req.file);
  const config = await getConfig();
  config.wallpapers = Array.isArray(config.wallpapers) ? config.wallpapers : [];
  const wallpaper = { id: `wallpaper_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, type: 'upload', name: req.file.originalname, url: meta.url, filename: req.file.filename, source: 'local', createdAt: meta.createdAt, size: req.file.size, mimeType: req.file.mimetype };
  config.wallpapers.push(wallpaper);
  config.settings.appearance.activeWallpaperId = wallpaper.id;
  config.settings.appearance.backgroundUrl = wallpaper.url;
  config.settings.appearance.backgroundType = 'url';
  await saveConfig(config);
  res.json(wallpaper);
}));

router.post('/backgrounds', (req, res) => bgUploadMany(req, res, async (err) => {
  if (err) return res.status(400).json({ error: err.message });
  const files = req.files || [];
  const createdAt = new Date().toISOString();
  const records = files.map((file) => ({ id: `wallpaper_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, type: 'upload', name: file.originalname, url: `/uploads/backgrounds/${file.filename}`, filename: file.filename, source: 'local', createdAt, size: file.size, mimeType: file.mimetype }));
  const config = await getConfig();
  config.wallpapers = Array.isArray(config.wallpapers) ? config.wallpapers : [];
  config.wallpapers.push(...records);
  if (records[0]) {
    config.settings.appearance.activeWallpaperId = records[0].id;
    config.settings.appearance.backgroundUrl = records[0].url;
    config.settings.appearance.backgroundType = 'url';
  }
  await saveConfig(config);
  res.json({ ok: true, files: records });
}));

router.post('/icon', (req, res) => iconUpload(req, res, (err) => err ? res.status(400).json({ error: err.message }) : res.json(toUploadMeta('icon', req.file))));
router.get('/backgrounds', async (_req, res) => res.json(await listUploads('background')));
router.get('/icons', async (_req, res) => res.json(await listUploads('icon')));
router.delete('/backgrounds/:filename', async (req, res) => { await deleteUpload('background', req.params.filename); res.json({ ok: true }); });
router.delete('/icons/:filename', async (req, res) => { await deleteUpload('icon', req.params.filename); res.json({ ok: true }); });

export default router;
