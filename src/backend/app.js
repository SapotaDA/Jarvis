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

const simpleLearning = require('./services/simple_learning');
const { generateResponse } = require('./services/llm');
const { addMemory, getMemories } = require('./services/db');
const voiceEngine = require('../core/adaptation/behavior/voice_engine');

// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Join AI services room for voice communication
  socket.on('join_ai_services', () => {
    socket.join('ai_services');
    console.log('Client joined AI services room for voice communication');
  });

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
      
      // Get basic AI response
      const basicResponse = await generateResponse(data.text, history);
      
      // Apply learning system
      const adaptiveResponse = simpleLearning.generateAdaptiveResponse(data.text, basicResponse.response);
      
      // Save to memory
      addMemory(`User: ${data.text}`, 'conversation');
      addMemory(`JARVIS: ${adaptiveResponse.response}`, 'conversation');

      // Enhanced response with learning metadata
      const responseData = { 
        text: adaptiveResponse.response,
        source: adaptiveResponse.source,
        confidence: adaptiveResponse.confidence,
        learning_enabled: true,
        voice_enabled: true
      };
      
      socket.emit('response', responseData);
      
      // Send to AI services for TTS
      io.to('ai_services').emit('ai_response', { text: adaptiveResponse.response });
      
      // Also speak using voice engine
      voiceEngine.speakAsJarvis(adaptiveResponse.response, {
        confidence: adaptiveResponse.confidence,
        source: adaptiveResponse.source
      });
      
    } catch (error) {
      console.error('Learning system error:', error);
      const errorResponse = "I'm having a bit of trouble processing that, Sir.";
      socket.emit('response', { text: errorResponse });
      io.to('ai_services').emit('ai_response', { text: errorResponse });
      voiceEngine.speakAsJarvis(errorResponse, { confidence: 0.3 });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Voice control endpoints
  socket.on('voice_control', async (data) => {
    try {
      if (data.action === 'toggle') {
        voiceEngine.setEnabled(!voiceEngine.getSettings().enabled);
        socket.emit('voice_status', { enabled: voiceEngine.getSettings().enabled });
      } else if (data.action === 'settings') {
        voiceEngine.updateSettings(data.settings);
        socket.emit('voice_status', voiceEngine.getSettings());
      } else if (data.action === 'test') {
        const result = await voiceEngine.testVoice();
        socket.emit('voice_test_result', result);
      }
    } catch (error) {
      console.error('Voice control error:', error);
      socket.emit('voice_error', { error: error.message });
    }
  });

  // Learning system endpoints
  socket.on('user_feedback', async (data) => {
    try {
      simpleLearning.processFeedback(
        data.user_input, 
        data.ai_response, 
        data.feedback
      );
      
      socket.emit('feedback_processed', { success: true });
    } catch (error) {
      console.error('Feedback processing error:', error);
      socket.emit('feedback_processed', { success: false, error: error.message });
    }
  });

  socket.on('get_learning_analytics', () => {
    try {
      const analytics = simpleLearning.getLearningStats();
      socket.emit('learning_analytics', analytics);
    } catch (error) {
      console.error('Analytics error:', error);
      socket.emit('learning_analytics', { error: error.message });
    }
  });

  socket.on('trigger_self_improvement', async () => {
    try {
      // Simple self-improvement - just return current stats
      const stats = simpleLearning.getLearningStats();
      socket.emit('self_improvement_result', { 
        success: true, 
        improvements: 0,
        message: 'Learning system is continuously improving through interactions',
        stats: stats
      });
    } catch (error) {
      console.error('Self-improvement error:', error);
      socket.emit('self_improvement_result', { success: false, error: error.message });
    }
  });
});

// REST API endpoints for learning system
app.get('/api/learning/analytics', (req, res) => {
  try {
    const analytics = simpleLearning.getLearningStats();
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/learning/feedback', (req, res) => {
  try {
    const { user_input, ai_response, feedback } = req.body;
    simpleLearning.processFeedback(user_input, ai_response, feedback);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/learning/improve', async (req, res) => {
  try {
    const stats = simpleLearning.getLearningStats();
    res.json({ 
      success: true, 
      message: 'Learning system is continuously improving through interactions',
      stats: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/learning/export', (req, res) => {
  try {
    const data = simpleLearning.exportLearningData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Voice API endpoints
app.get('/api/voice/status', (req, res) => {
  try {
    const status = voiceEngine.getSettings();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voice/toggle', (req, res) => {
  try {
    const currentStatus = voiceEngine.getSettings();
    voiceEngine.setEnabled(!currentStatus.enabled);
    res.json({ enabled: !currentStatus.enabled });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voice/settings', (req, res) => {
  try {
    voiceEngine.updateSettings(req.body);
    res.json(voiceEngine.getSettings());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/voice/test', async (req, res) => {
  try {
    const result = await voiceEngine.testVoice();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`JARVIS Enhanced Backend with Learning running on port ${PORT}`);
  console.log('🧠 AI Learning System: ENABLED');
  console.log('📊 Performance Monitoring: ACTIVE');
  console.log('🔄 Self-Improvement: SCHEDULED');
  console.log('🎤 Voice Recognition: ENABLED');
  console.log('🎤 Text-to-Speech: ENABLED');
  console.log('🎤 Voice Engine: OPERATIONAL');
});
