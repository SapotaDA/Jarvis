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
const { addMemory, getMemories } = require('./models/database');
const voiceEngine = require('../../core/adaptation/behavior/voice_engine');
const computerControl = require('./services/computer_control');
const newsService = require('./services/news_service');
const professionalSpeech = require('./services/professional_speech');

// Helper function to handle computer control commands
async function handleComputerCommand(text) {
  const lowerText = text.toLowerCase();
  
  // File operations
  if (lowerText.includes('create file') || lowerText.includes('new file')) {
    const match = text.match(/(?:create|new)\s+file\s+(.+)/i);
    if (match) {
      const result = await computerControl.createFile(match[1].trim(), '');
      return { text: result.success ? result.message : `Failed to create file: ${result.error}` };
    }
  }
  
  if (lowerText.includes('delete file') || lowerText.includes('remove file')) {
    const match = text.match(/(?:delete|remove)\s+file\s+(.+)/i);
    if (match) {
      const result = await computerControl.deleteFile(match[1].trim());
      return { text: result.success ? result.message : `Failed to delete file: ${result.error}` };
    }
  }
  
  if (lowerText.includes('list files') || lowerText.includes('show files')) {
    const match = text.match(/(?:list|show)\s+files\s+(.+)/i);
    const directory = match ? match[1].trim() : '.';
    const result = await computerControl.listFiles(directory);
    if (result.success) {
      const fileList = result.files.map(f => `${f.name} ${f.isDirectory ? '(folder)' : ''}`).join(', ');
      return { text: `Files in ${directory}: ${fileList}` };
    }
    return { text: `Failed to list files: ${result.error}` };
  }
  
  // Application control
  if (lowerText.includes('open') || lowerText.includes('launch')) {
    const match = text.match(/(?:open|launch)\s+(.+)/i);
    if (match) {
      const app = match[1].trim();
      const result = await computerControl.openApplication(app);
      return { text: result.success ? result.message : `Failed to open ${app}: ${result.error}` };
    }
  }
  
  if (lowerText.includes('screenshot') || lowerText.includes('capture screen')) {
    const result = await computerControl.takeScreenshot();
    return { text: result.success ? result.message : `Failed to take screenshot: ${result.error}` };
  }
  
  // System operations
  if (lowerText.includes('system info') || lowerText.includes('system status')) {
    const result = await computerControl.getSystemInfo();
    if (result.success) {
      const info = result.info;
      return { 
        text: `System Info: CPU: ${info.cpuCount} cores, Memory: ${(info.totalMemory / 1024 / 1024 / 1024).toFixed(2)}GB, Platform: ${info.platform}, Uptime: ${Math.floor(info.uptime / 3600)}h ${Math.floor((info.uptime % 3600) / 60)}m` 
      };
    }
    return { text: `Failed to get system info: ${result.error}` };
  }
  
  if (lowerText.includes('network status') || lowerText.includes('check internet')) {
    const result = await computerControl.checkInternetConnection();
    return { text: result.success && result.connected ? 'Internet connection is active' : 'No internet connection detected' };
  }
  
  // Volume control
  if (lowerText.includes('volume') || lowerText.includes('sound')) {
    const match = text.match(/volume\s*(\d+)/i);
    if (match) {
      const volume = parseInt(match[1]);
      const result = await computerControl.setVolume(volume);
      return { text: result.success ? result.message : `Failed to set volume: ${result.error}` };
    }
  }
  
  return null;
}

// Helper function to handle news commands
async function handleNewsCommand(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('news') || lowerText.includes('headline')) {
    if (lowerText.includes('latest') || lowerText.includes('current')) {
      return await newsService.getNewsSummary('general');
    }
    
    if (lowerText.includes('breaking') || lowerText.includes('urgent')) {
      return await newsService.getBreakingNews();
    }
    
    if (lowerText.includes('tech') || lowerText.includes('technology')) {
      return await newsService.getTechNews();
    }
    
    if (lowerText.includes('business') || lowerText.includes('market')) {
      return await newsService.getBusinessNews();
    }
    
    if (lowerText.includes('science') || lowerText.includes('research')) {
      return await newsService.getScienceNews();
    }
    
    if (lowerText.includes('sports')) {
      return await newsService.getSportsNews();
    }
    
    // Search for specific topic
    const match = text.match(/news\s+(?:about|on|for)\s+(.+)/i);
    if (match) {
      return await newsService.getNewsByTopic(match[1].trim());
    }
    
    return await newsService.getNewsSummary('general');
  }
  
  return null;
}

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
      // Handle computer control commands
      const computerCommand = await handleComputerCommand(data.text);
      if (computerCommand) {
        const professionalComputerResponse = professionalSpeech.processForProfessionalSpeech(computerCommand.text, {
          category: 'computer_control',
          data: { command: data.text }
        });
        
        socket.emit('response', { 
          text: professionalComputerResponse, 
          source: 'computer_control', 
          confidence: 0.9,
          voice_enabled: true
        });
        io.to('ai_services').emit('ai_response', { text: professionalComputerResponse });
        voiceEngine.speakAsJarvis(professionalComputerResponse, { 
          confidence: 0.9, 
          category: 'computer_control'
        });
        return;
      }

      // Handle news commands
      const newsResponse = await handleNewsCommand(data.text);
      if (newsResponse) {
        const professionalNewsResponse = professionalSpeech.processForProfessionalSpeech(newsResponse, {
          category: 'news',
          data: { query: data.text }
        });
        
        socket.emit('response', { 
          text: professionalNewsResponse, 
          source: 'news', 
          confidence: 0.9,
          voice_enabled: true
        });
        io.to('ai_services').emit('ai_response', { text: professionalNewsResponse });
        voiceEngine.speakAsJarvis(professionalNewsResponse, { 
          confidence: 0.9, 
          category: 'news'
        });
        return;
      }

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

      // Process response for professional speech
      const professionalResponse = professionalSpeech.processForProfessionalSpeech(adaptiveResponse.response, {
        category: 'general',
        data: { confidence: adaptiveResponse.confidence, source: adaptiveResponse.source }
      });

      // Enhanced response with learning metadata
      const responseData = { 
        text: professionalResponse,
        source: adaptiveResponse.source,
        confidence: adaptiveResponse.confidence,
        learning_enabled: true,
        voice_enabled: true
      };
      
      socket.emit('response', responseData);
      
      // Send to AI services for TTS
      io.to('ai_services').emit('ai_response', { text: professionalResponse });
      
      // Also speak using voice engine with professional processing
      voiceEngine.speakAsJarvis(professionalResponse, {
        confidence: adaptiveResponse.confidence,
        source: adaptiveResponse.source,
        category: 'general'
      });
      
    } catch (error) {
      console.error('Command processing error:', error);
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

// Computer Control API endpoints
app.get('/api/computer/system-info', async (req, res) => {
  try {
    const result = await computerControl.getSystemInfo();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/computer/open-app', async (req, res) => {
  try {
    const { app } = req.body;
    const result = await computerControl.openApplication(app);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/computer/open-url', async (req, res) => {
  try {
    const { url } = req.body;
    const result = await computerControl.openURL(url);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/computer/screenshot', async (req, res) => {
  try {
    const result = await computerControl.takeScreenshot();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/computer/create-file', async (req, res) => {
  try {
    const { path, content } = req.body;
    const result = await computerControl.createFile(path, content || '');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/computer/list-files', async (req, res) => {
  try {
    const { directory } = req.query;
    const result = await computerControl.listFiles(directory || '.');
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/computer/processes', async (req, res) => {
  try {
    const result = await computerControl.getRunningProcesses();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/computer/network-status', async (req, res) => {
  try {
    const result = await computerControl.checkInternetConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// News API endpoints
app.get('/api/news/headlines', async (req, res) => {
  try {
    const { category = 'general', limit = 10 } = req.query;
    const headlines = await newsService.getTopHeadlines(category, parseInt(limit));
    res.json(headlines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/news/search', async (req, res) => {
  try {
    const { query, category = 'general', limit = 10 } = req.query;
    const results = await newsService.searchNews(query, category, parseInt(limit));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/news/breaking', async (req, res) => {
  try {
    const breaking = await newsService.getBreakingNews();
    res.json({ text: breaking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/news/summary/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const summary = await newsService.getNewsSummary(category);
    res.json({ text: summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/news/status', async (req, res) => {
  try {
    const status = newsService.getCacheStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/news/clear-cache', async (req, res) => {
  try {
    const result = newsService.clearCache();
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
  console.log('🖥️ Computer Control: ENABLED');
  console.log('📰 News Integration: ENABLED');
  console.log('🔧 System Monitoring: ACTIVE');
});
