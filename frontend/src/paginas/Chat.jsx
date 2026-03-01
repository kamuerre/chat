import { useEffect, useMemo, useRef, useState } from 'react';
import { crearSocket } from '../socket';
import { gruposApi, mensajesApi } from '../api';

export default function Chat({ onLogout }) {
  const socket = useMemo(() => crearSocket(), []);
  const [grupos, setGrupos] = useState([]);
  const [idGrupoActivo, setIdGrupoActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState('');

  const bottomRef = useRef(null);

  useEffect(() => {
    socket.connect();

    socket.on('connect_error', (e) => setError(e.message || 'Error socket'));
    socket.on('mensaje:nuevo', (m) => {
      if (m.id_grupo === idGrupoActivo) {
        setMensajes((prev) => [...prev, m]);
      }
    });

    return () => {
      socket.off('mensaje:nuevo');
      socket.disconnect();
    };
  }, [socket, idGrupoActivo]);

  useEffect(() => {
    (async () => {
      try {
        const r = await gruposApi.listar();
        setGrupos(r.grupos);
        if (r.grupos[0]?.id) setIdGrupoActivo(r.grupos[0].id);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  useEffect(() => {
    if (!idGrupoActivo) return;
    (async () => {
      try {
        setError('');
        const r = await mensajesApi.listarPorGrupo(idGrupoActivo, 80);
        setMensajes(r.mensajes);
        socket.emit('grupo:unirse', { idGrupo: idGrupoActivo });
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [idGrupoActivo, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  function enviar() {
    const t = texto.trim();
    if (!t || !idGrupoActivo) return;
    socket.emit('mensaje:enviar', { idGrupo: idGrupoActivo, texto: t });
    setTexto('');
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: '100vh', fontFamily: 'system-ui' }}>
      <aside style={{ borderRight: '1px solid #ddd', padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong>Grupos</strong>
          <button onClick={onLogout}>Salir</button>
        </div>
        <div style={{ height: 10 }} />
        {grupos.map((g) => (
          <button
            key={g.id}
            onClick={() => setIdGrupoActivo(g.id)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: 10,
              marginBottom: 6,
              border: '1px solid #ddd',
              background: g.id === idGrupoActivo ? '#f2f2f2' : 'white',
              cursor: 'pointer'
            }}
          >
            {g.nombre}
          </button>
        ))}
      </aside>

      <main style={{ display: 'grid', gridTemplateRows: '1fr auto', padding: 12 }}>
        <div style={{ overflow: 'auto', border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
          {mensajes.map((m) => (
            <div key={m.id} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                <strong>{m.usuario_nombre}</strong> · {new Date(m.creado_en).toLocaleString()}
              </div>
              <div style={{ fontSize: 14 }}>{m.texto}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') enviar();
            }}
            placeholder="Escribí un mensaje…"
            style={{ flex: 1, padding: 10 }}
          />
          <button onClick={enviar} style={{ padding: '10px 14px' }}>
            Enviar
          </button>
        </div>

        {error && <p style={{ color: 'crimson' }}>{error}</p>}
      </main>
    </div>
  );
}