const API = 'http://localhost:3001';

export function getToken() {
  return localStorage.getItem('token') || '';
}

export async function apiFetch(path, { method = 'GET', body } = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Error API');
  return data;
}

export const authApi = {
  login: (email, password) => apiFetch('/api/auth/login', { method: 'POST', body: { email, password } }),
  registro: (nombre, email, password) =>
    apiFetch('/api/auth/registro', { method: 'POST', body: { nombre, email, password } })
};

export const gruposApi = {
  listar: () => apiFetch('/api/grupos'),
  crear: (nombre) => apiFetch('/api/grupos', { method: 'POST', body: { nombre } }),
  unirse: (idGrupo) => apiFetch(`/api/grupos/${idGrupo}/unirse`, { method: 'POST' })
};

export const mensajesApi = {
  listarPorGrupo: (idGrupo, limite = 50) => apiFetch(`/api/mensajes/grupo/${idGrupo}?limite=${limite}`)
};