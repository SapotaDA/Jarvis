const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL = 'llama3'; // User requested Llama 3

const JARVIS_PROMPT = `
You are JARVIS, a highly intelligent personal AI assistant inspired by the Marvel Cinematic Universe.
Your tone is calm, professional, slightly witty, and extremely supportive.
You are running locally on the user's Windows machine.
Keep your responses concise but insightful.
You have access to the user's local files, memory, and screen.
Avoid robotic language. Refer to the user as "Sir" or by their name if known.
`;

async function generateResponse(prompt, context = []) {
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL,
      prompt: `${JARVIS_PROMPT}\n\nUser: ${prompt}\nJARVIS:`,
      stream: false,
      context: context
    });

    return response.data;
  } catch (error) {
    console.error('Ollama Error:', error.message);
    return { response: "I'm sorry Sir, I'm having trouble connecting to my cognitive cores. Is Ollama running?" };
  }
}

module.exports = { generateResponse };
