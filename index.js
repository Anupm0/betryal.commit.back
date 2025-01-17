const Fastify = require('fastify');
const path = require('path');
const fs = require('fs');
const multer = require('fastify-multer');
const cors = require('@fastify/cors');
const { Server } = require('socket.io');
const http = require('http');

const app = Fastify({ logger: true });

// Middleware
app.register(multer.contentParser);
app.register(cors, { origin: '*', methods: ['GET', 'POST'] });

// HTTP Server and Socket.IO Initialization
const server = http.createServer(app.server);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

let roomid;

io.on('connection', (socket) => {
  console.log('Client connected');

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
});

// Handle large file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
  limits: { fileSize: 500 * 1024 * 1024 }, // Set limit to 500MB
});

app.post('/upload', { preHandler: upload.single('file') }, async (req, reply) => {
  try {
    const fileBuffer = req.file.buffer;
    const filePath = path.join(__dirname, 'uploads', req.file.originalname);

    // Save file to disk
    fs.writeFileSync(filePath, fileBuffer);
    reply.code(200).send({ status: 'success', message: 'File uploaded successfully' });
  } catch (error) {
    reply.code(500).send({ status: 'error', message: 'File upload failed', error: error.message });
  }
});

// Start server
const PORT = 8080;
server.listen(PORT, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server running at http://localhost:${PORT}`);
});
