import express from 'express';
import { getConfig, resetConfig, saveConfig } from '../services/config.service.js';

const router = express.Router();

router.get('/', async (_req, res) => res.json(await getConfig()));
router.put('/', async (req, res) => {
  try { res.json(await saveConfig(req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
});
router.post('/reset', async (_req, res) => res.json(await resetConfig()));
router.get('/export', async (_req, res) => res.json(await getConfig()));
router.post('/import', async (req, res) => {
  try { res.json(await saveConfig(req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
});

export default router;
