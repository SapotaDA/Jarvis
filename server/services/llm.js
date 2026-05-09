const https = require('https');
const http = require('http');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/chat';
const MODEL = 'qwen3.5:latest';

const SYSTEM_PROMPT = `
You are JARVIS, a highly intelligent personal AI assistant inspired by the MCU.
Your tone is calm, professional, and slightly witty.
Keep responses concise. Refer to the user as "Sir".
`;

async function generateResponse(prompt, history = []) {
  // First try Ollama models
  const models = ['qwen3.5:latest', 'llama3.2:3b', 'llama3', 'phi3', 'tinyllama', 'mistral', 'llama2'];
  
  for (const model of models) {
    try {
      console.log(`Attempting JARVIS response with model: ${model}`);
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
        { role: 'user', content: prompt }
      ];

      const response = await new Promise((resolve, reject) => {
        const data = JSON.stringify({
          model: model,
          messages: messages,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 500
          }
        });

        const protocol = OLLAMA_URL.startsWith('https') ? https : http;
        const req = protocol.request(OLLAMA_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
          },
          timeout: 30000
        }, (res) => {
          let responseData = '';
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          res.on('end', () => {
            try {
              const parsed = JSON.parse(responseData);
              resolve(parsed);
            } catch (error) {
              reject(error);
            }
          });
        });

        req.on('error', reject);
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Request timeout'));
        });

        req.write(data);
        req.end();
      });

      if (response && response.message) {
        console.log(`✅ Successfully used model: ${model}`);
        return { response: response.message.content, source: 'ollama', confidence: 0.9 };
      }
    } catch (error) {
      console.warn(`Model ${model} failed:`, error.message);
      continue; // Try next model
    }
  }

  // Fallback responses when Ollama is not available
  console.log('Using fallback response system');
  const fallbackResponses = {
    'hello': 'Hello Sir. JARVIS is online and ready to assist you.',
    'hi': 'Greetings Sir. How may I help you today?',
    'system-init': 'All systems online and ready, Sir.',
    'what time': `The current time is ${new Date().toLocaleTimeString()}.`,
    'time': `The current time is ${new Date().toLocaleTimeString()}.`,
    'how are you': 'I am functioning optimally, Sir. Thank you for asking.',
    'thank you': 'You are welcome, Sir. It is my pleasure to assist.',
    'bye': 'Goodbye, Sir. I will be here when you need me.',
    'open chrome': 'I would be happy to open Chrome for you, Sir. However, I am currently focused on voice commands and system responses.',
    'default': 'I am processing your request, Sir. My AI cores are warming up. Please try again in a moment.'
  };

  const lowerPrompt = prompt.toLowerCase();
  
  for (const [key, response] of Object.entries(fallbackResponses)) {
    if (lowerPrompt.includes(key)) {
      return { response };
    }
  }
  
  return { response: fallbackResponses.default };
}

module.exports = { generateResponse };
