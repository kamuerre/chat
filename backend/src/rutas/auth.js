import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { config } from '../config.js';

export const authRouter = Router();

authRouter.post('/registro', async (req, res) => {
  const { nombre, email, password } = req.body || {};
  if (!nombre || !email || !password) {
    return res.status(400).json({ ok: false, error: 'Faltan datos' });
  }

  const [existe] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existe.length) return res.status(409).json({ ok: false, error: 'Email ya existe' });

  const password_hash = await bcrypt.hash(password, 10);
  const [r] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?,?,?)',
    [nombre, email, password_hash]
  );

  return res.json({ ok: true, id: r.insertId });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: 'Faltan datos' });

  const [rows] = await pool.query('SELECT id, nombre, email, password_hash FROM usuarios WHERE email = ?', [email]);
  if (!rows.length) return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });

  const u = rows[0];
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ ok: false, error: 'Credenciales inválidas' });

  const token = jwt.sign({ id: u.id, nombre: u.nombre, email: u.email }, config.jwtSecret, { expiresIn: '7d' });
  return res.json({ ok: true, token, usuario: { id: u.id, nombre: u.nombre, email: u.email } });
});