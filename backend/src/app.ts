import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

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
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/v1', routes);

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
