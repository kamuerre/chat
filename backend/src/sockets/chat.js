import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { pool } from '../db.js';

export function configurarSockets(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Sin token'));
      const payload = jwt.verify(token, config.jwtSecret);
      socket.usuario = payload; // {id, nombre, email}
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('grupo:unirse', async ({ idGrupo }) => {
      const gid = Number(idGrupo);
      const [memb] = await pool.query(
        'SELECT 1 FROM usuarios_grupos WHERE id_usuario=? AND id_grupo=? LIMIT 1',
        [socket.usuario.id, gid]
      );
      if (!memb.length) return;
      socket.join(`grupo:${gid}`);
    });

    socket.on('mensaje:enviar', async ({ idGrupo, texto }) => {
      const gid = Number(idGrupo);
      const contenido = (texto || '').trim();
      if (!gid || !contenido) return;

      const [memb] = await pool.query(
        'SELECT 1 FROM usuarios_grupos WHERE id_usuario=? AND id_grupo=? LIMIT 1',
        [socket.usuario.id, gid]
      );
      if (!memb.length) return;

      const [r] = await pool.query(
        'INSERT INTO mensajes (texto, id_usuario, id_grupo) VALUES (?,?,?)',
        [contenido, socket.usuario.id, gid]
      );

      const payload = {
        id: r.insertId,
        texto: contenido,
        id_usuario: socket.usuario.id,
        usuario_nombre: socket.usuario.nombre,
        id_grupo: gid,
        creado_en: new Date().toISOString()
      };

      io.to(`grupo:${gid}`).emit('mensaje:nuevo', payload);
    });
  });
}