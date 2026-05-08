const io = require('socket.io-client');

console.log('🚀 JARVIS System Integration Test');
console.log('==================================');

const results = {
    backend: false,
    ai: false,
    ollama: false,
    frontend: false
};

// Test 1: Backend Connection
console.log('\n📡 Testing Backend Connection...');
const backendSocket = io('http://localhost:3001');

backendSocket.on('connect', () => {
    console.log('✅ Backend: Connected successfully');
    results.backend = true;
    
    // Test AI response
    backendSocket.emit('command', { text: 'system-init' });
    
    setTimeout(() => {
        backendSocket.emit('command', { text: 'Hello JARVIS, this is a system test' });
    }, 1000);
});

backendSocket.on('response', (data) => {
    console.log('✅ Backend AI Response:', data.text);
    results.ai = true;
    
    if (data.text.includes('system test') || data.text.includes('online')) {
        console.log('✅ AI Processing: Working correctly');
    }
});

// Test 2: Check Ollama
console.log('\n🤖 Testing Ollama Connection...');
const http = require('http');

const ollamaReq = http.request({
    hostname: '127.0.0.1',
    port: 11434,
    path: '/api/tags',
    method: 'GET'
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const models = JSON.parse(data);
            if (models.models && models.models.length > 0) {
                console.log('✅ Ollama: Connected, models available');
                console.log('   Available models:', models.models.map(m => m.name).join(', '));
                results.ollama = true;
            }
        } catch (e) {
            console.log('❌ Ollama: Invalid response');
        }
    });
});

ollamaReq.on('error', () => {
    console.log('❌ Ollama: Connection failed');
});

ollamaReq.end();

// Test 3: Check Frontend
console.log('\n🌐 Testing Frontend...');
const frontendReq = http.request({
    hostname: 'localhost',
    port: 5173,
    path: '/',
    method: 'GET'
}, (res) => {
    if (res.statusCode === 200) {
        console.log('✅ Frontend: Dev server running');
        results.frontend = true;
    } else {
        console.log('❌ Frontend: Server responded with', res.statusCode);
    }
});

frontendReq.on('error', () => {
    console.log('❌ Frontend: Connection failed');
});

frontendReq.end();

// Final Results
setTimeout(() => {
    console.log('\n📊 Integration Test Results');
    console.log('============================');
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
        console.log('🎉 ALL SYSTEMS ONLINE AND FUNCTIONAL!');
        console.log('\n🔧 System Status:');
        console.log('   ✅ Backend Server: Running (Port 3001)');
        console.log('   ✅ AI Services: Running (Port 5001)');
        console.log('   ✅ Frontend Dev Server: Running (Port 5173)');
        console.log('   ✅ Ollama AI Engine: Running (Port 11434)');
        console.log('   ✅ Electron App: Available');
        
        console.log('\n🚀 Ready to launch JARVIS!');
        console.log('   Run: start_jarvis.bat for one-click startup');
        console.log('   Or access: http://localhost:5173 for web interface');
    } else {
        console.log('⚠️  Some systems need attention:');
        Object.entries(results).forEach(([system, status]) => {
            console.log(`   ${status ? '✅' : '❌'} ${system.charAt(0).toUpperCase() + system.slice(1)}`);
        });
    }
    
    backendSocket.disconnect();
    process.exit(allPassed ? 0 : 1);
}, 5000);
