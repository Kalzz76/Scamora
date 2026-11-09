import type { IncomingMessage, ServerResponse } from 'http';
import app from '../backend/src/app';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.url && !req.url.startsWith('/api') && req.url.startsWith('/v1')) {
    req.url = `/api${req.url}`;
  }
  return app(req as any, res as any);
}
