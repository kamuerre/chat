import { io } from 'socket.io-client';
import { getToken } from './api';

const API = 'http://localhost:3001';

export function crearSocket() {
  return io(API, {
    autoConnect: false,
    auth: { token: getToken() }
  });
}