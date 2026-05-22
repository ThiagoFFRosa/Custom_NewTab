import express from 'express';
import cors from 'cors';
import configRoutes from './routes/config.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { UPLOADS_DIR } from './paths.js';

const app = express();
const PORT = process.env.PORT || 4178;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/api/config', configRoutes);
app.use('/api/uploads', uploadRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'custom-newtab-api' });
});

app.listen(PORT, () => console.log(`Custom NewTab API running on http://localhost:${PORT}`));
