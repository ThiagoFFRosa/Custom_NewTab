import express from 'express';
import cors from 'cors';
import path from 'path';
import configRoutes from './routes/config.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express();
const PORT = process.env.PORT || 4178;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.resolve('backend/uploads')));
app.use('/api/config', configRoutes);
app.use('/api/uploads', uploadRoutes);

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
