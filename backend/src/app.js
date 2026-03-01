import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { authRouter } from './rutas/auth.js';
import { gruposRouter } from './rutas/grupos.js';
import { mensajesRouter } from './rutas/mensajes.js';

export function crearApp() {
  const app = express();
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json());

  app.get('/health', (_, res) => res.json({ ok: true }));

  app.use('/api/auth', authRouter);
  app.use('/api/grupos', gruposRouter);
  app.use('/api/mensajes', mensajesRouter);

  return app;
}