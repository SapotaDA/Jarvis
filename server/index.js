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

const { generateResponse } = require('./llm');
const { addMemory, getMemories } = require('./db');

// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('command', async (data) => {
    console.log('Received command:', data.text);
    
    if (data.text === 'system-init') {
      socket.emit('response', { text: "I'm online and ready to assist you, Sir." });
      return;
    }

    try {
      // Get some context from memory
      const recentMemories = getMemories(10);
      const history = recentMemories.reverse().map(m => {
        if (m.content.startsWith('User: ')) {
          return { role: 'user', content: m.content.replace('User: ', '') };
        } else {
          return { role: 'assistant', content: m.content.replace('JARVIS: ', '') };
        }
      });
      
      const aiResponse = await generateResponse(data.text, history);
      
      // Save to memory
      addMemory(`User: ${data.text}`, 'conversation');
      addMemory(`JARVIS: ${aiResponse.response}`, 'conversation');

      socket.emit('response', { text: aiResponse.response });
    } catch (error) {
      socket.emit('response', { text: "I'm having a bit of trouble processing that, Sir." });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`JARVIS Backend running on port ${PORT}`);
});
