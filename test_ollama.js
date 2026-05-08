const axios = require('axios');

async function testOllama() {
  console.log('🤖 Testing Ollama AI...');
  
  try {
    const response = await axios.post('http://127.0.0.1:11434/api/chat', {
      model: 'qwen3.5:latest',
      messages: [
        { role: 'user', content: 'Hello, respond with just "Working"' }
      ],
      stream: false,
      options: {
        temperature: 0.7,
        max_tokens: 50
      }
    }, { timeout: 10000 });

    if (response.data && response.data.message) {
      console.log('✅ Ollama Response:', response.data.message.content);
      return true;
    }
  } catch (error) {
    console.log('❌ Ollama Error:', error.message);
    return false;
  }
  
  return false;
}

testOllama().then(success => {
  if (success) {
    console.log('✅ Ollama is working correctly');
  } else {
    console.log('❌ Ollama needs attention');
  }
  process.exit(success ? 0 : 1);
});
