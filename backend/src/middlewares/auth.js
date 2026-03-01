import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) return res.status(401).json({ ok: false, error: 'Sin token' });

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.usuario = payload; // { id, nombre, email }
    next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Token inválido' });
  }
}