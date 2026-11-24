import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import ttsHandler from './api/tts';
import transcribeHandler from './api/transcribe-to-json';
import enhanceHandler from './api/enhance-text';
import healthHandler from './api/health';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limit for audio files (base64)
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

// Mount API routes (shared with Vercel serverless functions)
app.all('/api/health', (req: Request, res: Response) => healthHandler(req, res));
app.all('/api/tts', (req: Request, res: Response) => ttsHandler(req, res));
app.all('/api/transcribe-to-json', (req: Request, res: Response) => transcribeHandler(req, res));
app.all('/api/enhance-text', (req: Request, res: Response) => enhanceHandler(req, res));

// Setup Vite in Dev or Serve Static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static client files
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
