const io = require('socket.io-client');

console.log('🎤 Testing JARVIS Voice AI System...');

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

let testCommands = [
  'system-init',
  'hello jarvis',
  'what time is it',
  'open chrome browser',
  'tell me a joke'
];

let currentTest = 0;

socket.on('connect', () => {
  console.log('✅ Connected to JARVIS Backend');
  
  // Start testing commands
  setTimeout(() => {
    runNextTest();
  }, 1000);
});

socket.on('response', (data) => {
  console.log('🤖 JARVIS Response:', data.text);
  
  // Move to next test after a delay
  setTimeout(() => {
    currentTest++;
    if (currentTest < testCommands.length) {
      runNextTest();
    } else {
      console.log('✅ All tests completed!');
      socket.disconnect();
      process.exit(0);
    }
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection error:', error.message);
  process.exit(1);
});

function runNextTest() {
  const command = testCommands[currentTest];
  console.log(`📢 Sending command ${currentTest + 1}/${testCommands.length}: "${command}"`);
  socket.emit('command', { text: command });
}

// Timeout after 30 seconds
setTimeout(() => {
  console.log('❌ Test timed out');
  socket.disconnect();
  process.exit(1);
}, 30000);
