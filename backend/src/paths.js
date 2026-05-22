import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const BACKEND_ROOT = path.resolve(__dirname, '..');
export const DATA_DIR = path.join(BACKEND_ROOT, 'data');
export const UPLOADS_DIR = path.join(BACKEND_ROOT, 'uploads');
