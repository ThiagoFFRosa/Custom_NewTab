import fs from 'fs/promises';
import path from 'path';
import { getConfig, saveConfig } from './config.service.js';

import { UPLOADS_DIR } from '../paths.js';

const uploadRoot = UPLOADS_DIR;

export function toUploadMeta(type, file) {
  const folder = type === 'background' ? 'backgrounds' : 'icons';
  return {
    id: `${type}-${Date.now()}`,
    type,
    originalName: file.originalname,
    filename: file.filename,
    url: `/uploads/${folder}/${file.filename}`,
    size: file.size,
    mimeType: file.mimetype,
    createdAt: new Date().toISOString()
  };
}

export async function listUploads(type) {
  const folder = type === 'background' ? 'backgrounds' : 'icons';
  const dir = path.join(uploadRoot, folder);
  await fs.mkdir(dir, { recursive: true });
  const files = (await fs.readdir(dir)).filter((f) => !f.startsWith('.'));
  return files.map((filename) => ({ filename, url: `/uploads/${folder}/${filename}` }));
}

export async function deleteUpload(type, filename) {
  const folder = type === 'background' ? 'backgrounds' : 'icons';
  const filePath = path.join(uploadRoot, folder, path.basename(filename));
  await fs.unlink(filePath);

  const config = await getConfig();
  if (type === 'background' && config.settings?.appearance?.backgroundUrl?.includes(filename)) {
    config.settings.appearance.backgroundUrl = '';
    config.settings.appearance.backgroundType = 'color';
  }
  if (type === 'icon') {
    config.shortcuts = config.shortcuts.map((s) => {
      if (s.iconType === 'image' && s.iconValue?.includes(filename)) {
        return { ...s, iconType: 'text', iconValue: (s.title || 'S').slice(0, 2).toUpperCase() };
      }
      return s;
    });
  }
  await saveConfig(config);
}
