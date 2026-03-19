import { Server } from 'socket.io';
import { config } from '../config/index.js';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(',').map((o) => o.trim()),
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('match:join', ({ matchId }) => {
      if (!matchId) return;
      socket.join(`match:${matchId}`);
    });

    socket.on('match:leave', ({ matchId }) => {
      if (!matchId) return;
      socket.leave(`match:${matchId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized. Call initSocket(httpServer) first.');
  return io;
};

