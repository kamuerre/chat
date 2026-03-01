import http from 'http';
import { Server } from 'socket.io';
import { config } from './config.js';
import { crearApp } from './app.js';
import { configurarSockets } from './sockets/chat.js';

const app = crearApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: config.corsOrigin, credentials: true }
});

configurarSockets(io);

server.listen(config.port, () => {
  console.log(`API + WS en http://localhost:${config.port}`);
});