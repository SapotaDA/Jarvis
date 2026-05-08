const io = require('socket.io-client');

console.log('Testing JARVIS Backend...');

const socket = io('http://localhost:3001');

socket.on('connect', () => {
    console.log('✓ Connected to backend successfully');
    
    // Test system init
    socket.emit('command', { text: 'system-init' });
    
    // Test a simple command
    setTimeout(() => {
        socket.emit('command', { text: 'Hello JARVIS, can you hear me?' });
    }, 1000);
});

socket.on('response', (data) => {
    console.log('✓ Response received:', data.text);
    
    if (data.text.includes('hear me') || data.text.includes('online')) {
        console.log('✓ Backend AI functionality working');
        socket.disconnect();
        process.exit(0);
    }
});

socket.on('disconnect', () => {
    console.log('✓ Disconnected from backend');
});

socket.on('connect_error', (error) => {
    console.log('✗ Connection error:', error.message);
    process.exit(1);
});

// Timeout after 10 seconds
setTimeout(() => {
    console.log('✗ Test timed out');
    process.exit(1);
}, 10000);
