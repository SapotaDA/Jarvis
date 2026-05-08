const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('command', async (data) => {
    console.log('Received command:', data);
    // Process command via LLM or Automation
    socket.emit('response', { text: `Processing: ${data.text}` });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`JARVIS Backend running on port ${PORT}`);
});
