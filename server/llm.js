const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/chat';
const MODEL = 'qwen3.5:latest';

const SYSTEM_PROMPT = `
You are JARVIS, a highly intelligent personal AI assistant inspired by the MCU.
Your tone is calm, professional, and slightly witty.
Keep responses concise. Refer to the user as "Sir".
`;

async function generateResponse(prompt, history = []) {
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: prompt }
    ];

    const response = await axios.post(OLLAMA_URL, {
      model: MODEL,
      messages: messages,
      stream: false
    });

    return { response: response.data.message.content };
  } catch (error) {
    console.error('Ollama Error:', error.message);
    return { response: "I'm sorry Sir, I'm having trouble connecting to my cognitive cores. Is Ollama running?" };
  }
}

module.exports = { generateResponse };
