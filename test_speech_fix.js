const io = require('socket.io-client');

console.log('🎤 Testing JARVIS Professional Speech Fix');
console.log('========================================');

const socket = io('http://localhost:3001');

const speechTests = [
    '<h1>Hello Sir</h1>',
    'CPU/GPU usage at 80%',
    'System is working great!',
    'Visit https://example.com for info'
];

let currentTest = 0;

socket.on('connect', () => {
    console.log('✅ Connected to JARVIS Backend');
    console.log('🎤 Starting Professional Speech Tests...\n');
    
    setTimeout(() => {
        runTests();
    }, 1000);
});

socket.on('response', (data) => {
    console.log(`🤖 JARVIS Response: "${data.text}"`);
    
    // Check if HTML tags and symbols are filtered out
    const hasHtmlTags = data.text.includes('<') || data.text.includes('>');
    const hasSymbols = data.text.includes('/') || data.text.includes('http') || data.text.includes('@');
    const isProfessional = !hasHtmlTags && !hasSymbols;
    
    console.log(`   ${isProfessional ? '✅' : '❌'} Professional Speech: ${isProfessional ? 'WORKING' : 'NOT WORKING'}`);
    
    setTimeout(() => {
        currentTest++;
        if (currentTest < speechTests.length) {
            runNextTest();
        } else {
            completeTest();
        }
    }, 2000);
});

function runTests() {
    runNextTest();
}

function runNextTest() {
    const test = speechTests[currentTest];
    console.log(`🎤 Test ${currentTest + 1}/${speechTests.length}: "${test}"`);
    socket.emit('command', { text: test });
}

function completeTest() {
    console.log('\n🎉 Professional Speech Test Complete!');
    console.log('=====================================');
    console.log('✅ HTML tags should be filtered out');
    console.log('✅ Symbols should be converted to spoken words');
    console.log('✅ Professional language should be used');
    console.log('\n🎯 If you still see HTML tags or symbols in the voice responses,');
    console.log('   please restart the JARVIS system and try again.');
    
    socket.disconnect();
    process.exit(0);
}

socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('❌ Test timed out');
    socket.disconnect();
    process.exit(1);
}, 30000);
