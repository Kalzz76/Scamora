import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Trust proxy for Vercel / Cloudflare edge reverse proxy to ensure accurate client IP in rateLimiters
app.set('trust proxy', 1);

const allowedOrigins = [
  env.FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
].filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server) or in whitelist
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Dev-friendly fallback
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'x-guest-session-id',
      'X-Guest-Session-Id',
      'X-Requested-With',
    ],
    exposedHeaders: ['x-guest-session-id', 'X-Guest-Session-Id'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Vercel Serverless URL Normalizer
app.use((req, _res, next) => {
  const vercelPath = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-url'] as string);
  if (vercelPath && req.url.includes('server')) {
    req.url = vercelPath;
  }
  if (req.url && !req.url.startsWith('/api') && req.url.startsWith('/v1')) {
    req.url = `/api${req.url}`;
  }
  next();
});

// Root welcome / health check for browser inspection
app.get(['/', '/api', '/api/index', '/api/index.ts'], (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'scamora-backend-api',
    message: 'Backend Scamora berhasil berjalan di Vercel!',
    version: '2.1.0',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      analyze: '/api/v1/analyze',
      community: '/api/v1/community',
      challenges: '/api/v1/challenges'
    }
  });
});

app.use('/api/v1', routes);
app.use('/v1', routes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Rute tidak ditemukan.',
    },
  });
});

app.use(errorHandler);

export default app;
