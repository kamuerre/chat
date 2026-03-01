import { Router } from 'express';
import { pool } from '../db.js';
import { auth } from '../middlewares/auth.js';

export const gruposRouter = Router();

gruposRouter.get('/', auth, async (req, res) => {
  // Solo grupos donde el usuario es miembro
  const [rows] = await pool.query(
    `SELECT g.id, g.nombre
     FROM grupos g
     JOIN usuarios_grupos ug ON ug.id_grupo = g.id
     WHERE ug.id_usuario = ?
     ORDER BY g.nombre`,
    [req.usuario.id]
  );
  res.json({ ok: true, grupos: rows });
});

gruposRouter.post('/', auth, async (req, res) => {
  const { nombre } = req.body || {};
  if (!nombre) return res.status(400).json({ ok: false, error: 'Falta nombre' });

  const [r] = await pool.query('INSERT INTO grupos (nombre) VALUES (?)', [nombre]);
  // auto-join creador
  await pool.query('INSERT INTO usuarios_grupos (id_usuario, id_grupo) VALUES (?,?)', [req.usuario.id, r.insertId]);

  res.json({ ok: true, id: r.insertId });
});

gruposRouter.post('/:idGrupo/unirse', auth, async (req, res) => {
  const idGrupo = Number(req.params.idGrupo);
  if (!idGrupo) return res.status(400).json({ ok: false, error: 'Grupo inválido' });

  try {
    await pool.query('INSERT INTO usuarios_grupos (id_usuario, id_grupo) VALUES (?,?)', [req.usuario.id, idGrupo]);
    res.json({ ok: true });
  } catch (e) {
    // duplicado por uq_usuario_grupo
    res.json({ ok: true });
  }
});