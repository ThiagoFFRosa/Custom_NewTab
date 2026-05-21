import path from 'path';
import crypto from 'crypto';

const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

export function getSafeFileName(type, originalName) {
  const ext = path.extname(originalName || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error('Tipo de arquivo não permitido. Use PNG, JPG, JPEG ou WEBP.');
  }
  const random = crypto.randomBytes(4).toString('hex');
  return `${type}-${Date.now()}-${random}${ext}`;
}

export function isAllowedMime(mimeType) {
  return ['image/png', 'image/jpeg', 'image/webp'].includes(mimeType);
}
