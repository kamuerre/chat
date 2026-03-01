import { Router } from 'express';
import { pool } from '../db.js';
import { auth } from '../middlewares/auth.js';

export const mensajesRouter = Router();

// Traer últimos N mensajes del grupo (si sos miembro)
mensajesRouter.get('/grupo/:idGrupo', auth, async (req, res) => {
  const idGrupo = Number(req.params.idGrupo);
  const limite = Math.min(Number(req.query.limite || 50), 200);

  const [memb] = await pool.query(
    'SELECT 1 FROM usuarios_grupos WHERE id_usuario=? AND id_grupo=? LIMIT 1',
    [req.usuario.id, idGrupo]
  );
  if (!memb.length) return res.status(403).json({ ok: false, error: 'No sos miembro del grupo' });

  const [rows] = await pool.query(
    `SELECT m.id, m.texto, m.id_usuario, u.nombre as usuario_nombre, m.id_grupo, m.creado_en
     FROM mensajes m
     JOIN usuarios u ON u.id = m.id_usuario
     WHERE m.id_grupo = ?
     ORDER BY m.creado_en DESC
     LIMIT ?`,
    [idGrupo, limite]
  );

  // devolvemos en orden asc para render
  res.json({ ok: true, mensajes: rows.reverse() });
});