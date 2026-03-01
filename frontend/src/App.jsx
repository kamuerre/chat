import { useEffect, useState } from 'react';
import Login from './paginas/Login.jsx';
import Chat from './paginas/Chat.jsx';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem('token') || '');
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!token) return <Login onLogin={(t) => setToken(t)} />;

  return (
    <Chat
      onLogout={() => {
        localStorage.removeItem('token');
        setToken('');
      }}
    />
  );
}