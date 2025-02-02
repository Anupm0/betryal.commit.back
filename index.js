const fs = require('fs');
const multer = require('multer');
const path = require('path');
const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
const { Server } = require("socket.io");

// Configure Express for large payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const server = http.createServer(app);

// Configure Socket.IO with increased buffer size
const io = new Server(server, {
  cors: { 
    origins: '*:*', 
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e8, // 100 MB
  pingTimeout: 60000, // 60 seconds
  transports: ['websocket', 'polling'],
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  }
});

var roomid;

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.setMaxListeners(20);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('joinRoom', (room) => {
    socket.join(room);
    roomid = room;
  });

  socket.on('message', (message) => {
    io.to(roomid).emit('message', message);
  });

  socket.on('response', (message) => {
    io.to(roomid).emit('response', message);
  });

  // Error handling for large file transfers
  socket.conn.on('error', (error) => {
    console.error('Socket connection error:', error);
    socket.conn.transport.close();
  });
});

// Increase server timeout
server.timeout = 600000; // 10 minutes
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO Server listening on port ${PORT}`);
});