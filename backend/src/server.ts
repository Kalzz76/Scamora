import express from 'express';
import app from './app';
import { env } from './config/env';

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`Server Scamora backend berjalan di port ${env.PORT}`);
  });
}

export default app;
