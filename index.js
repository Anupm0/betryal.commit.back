
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

const io = new Server(server, { cors: { origins: '*:*', methods: ["GET", "POST"] } });
io.on('connection', (socket) => {
  console.log('Client connected');
   
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  socket.on('joinRoom', (room) => {
    socket.join(room)
    roomid = room
  });

socket.on('message', (message) => {
  io.to(roomid).emit('message', message);
});

socket.on('response', (message) => {
  io.to(roomid).emit('response', message);
});
  
  
});


const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Socket.IO Server listening on port ${PORT}`);
});