
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const express = require('express');
const http = require('http');
const app = express();
const cors = require('cors');
const { Server } = require("socket.io")

var roomid;
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { 
    origins: '*:*', 
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 1e8, // 100 MB
  pingTimeout: 60000, // 60 seconds
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  upgradeTimeout: 30000,
});

server.timeout = 300000;


io.on('connection', (socket) => {
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
  
  socket.conn.on('packet', (packet) => {
    if (packet.type === 'error') {
      console.error('Packet error:', packet.data);
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('joinRoom', (room) => {
    socket.join(room)
    roomid = room
  });

// Inside the `on('message')` event in server.js
socket.on('message', (message) => {
    try {
        const parsedMessage = JSON.parse(message);
        const { commands, data } = parsedMessage;

        // Emit to clients in the room
        io.to(roomid).emit('response', JSON.stringify({ type: commands, data }));

        // Handle image uploads or specific commands (if needed)
        if (commands === 'image_data') {
            console.log('Image received, processing...');
        }
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

socket.on('response', (message) => {
  io.to(roomid).emit('response', message);
});
  
  
});


const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO Server listening on port ${PORT}`);
});
