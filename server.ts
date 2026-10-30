import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint — Strictly Zero-AI & Stateless RAM-Only Mode
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    zeroAiMode: true,
    ramOnlyMode: true,
    serverStorageBytes: 0,
    timestamp: new Date().toISOString(),
  });
});

// Setup Vite in development or static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');
  const hasDist = fs.existsSync(path.join(distPath, 'index.html'));

  if (isProd || hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `[Maniq CyberShield Server] Zero-AI & RAM-Only Mode listening on http://0.0.0.0:${PORT} (env: ${
        isProd ? 'production' : 'development'
      }, static dist: ${hasDist})`
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
