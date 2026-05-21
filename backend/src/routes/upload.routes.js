import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { getSafeFileName, isAllowedMime } from '../utils/fileName.js';
import { deleteUpload, listUploads, toUploadMeta } from '../services/upload.service.js';

const router = express.Router();

function createStorage(folder, label) {
  return multer({
    storage: multer.diskStorage({
      destination: async (_req, _file, cb) => {
        const dir = path.resolve(`backend/uploads/${folder}`);
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

const bgUpload = createStorage('backgrounds', 'background').single('file');
const iconUpload = createStorage('icons', 'icon').single('file');

router.post('/background', (req, res) => bgUpload(req, res, (err) => err ? res.status(400).json({ error: err.message }) : res.json(toUploadMeta('background', req.file))));
router.post('/icon', (req, res) => iconUpload(req, res, (err) => err ? res.status(400).json({ error: err.message }) : res.json(toUploadMeta('icon', req.file))));
router.get('/backgrounds', async (_req, res) => res.json(await listUploads('background')));
router.get('/icons', async (_req, res) => res.json(await listUploads('icon')));
router.delete('/backgrounds/:filename', async (req, res) => { await deleteUpload('background', req.params.filename); res.json({ ok: true }); });
router.delete('/icons/:filename', async (req, res) => { await deleteUpload('icon', req.params.filename); res.json({ ok: true }); });

export default router;
