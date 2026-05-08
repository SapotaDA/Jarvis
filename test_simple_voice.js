const io = require('socket.io-client');

console.log('🎤 Testing JARVIS Voice System');
console.log('==============================');

const socket = io('http://localhost:3001');

let testResults = {
    backend_connection: false,
    voice_response: false,
    learning_integration: false
};

const testCommands = [
    'hello jarvis',
    'what time is it',
    'how are you'
];

let currentTest = 0;

socket.on('connect', () => {
    console.log('✅ Connected to JARVIS Backend');
    testResults.backend_connection = true;
    
    setTimeout(() => {
        runVoiceTest();
    }, 1000);
});

socket.on('response', (data) => {
    console.log(`🤖 JARVIS [${data.source || 'unknown'}]:`);
    console.log(`   "${data.text}"`);
    
    if (data.voice_enabled) {
        console.log('   🎤 Voice Response: ENABLED');
        testResults.voice_response = true;
    }
    
    if (data.learning_enabled) {
        console.log('   🧠 Learning: ENABLED');
        testResults.learning_integration = true;
    }
    
    setTimeout(() => {
        currentTest++;
        if (currentTest < testCommands.length) {
            runNextTest();
        } else {
            completeTest();
        }
    }, 2000);
});

function runVoiceTest() {
    console.log('\n🎤 Starting Voice Tests...\n');
    runNextTest();
}

function runNextTest() {
    const command = testCommands[currentTest];
    console.log(`🎤 Test ${currentTest + 1}/${testCommands.length}: "${command}"`);
    socket.emit('command', { text: command });
}

function completeTest() {
    console.log('\n🎯 Voice Test Results:');
    console.log('=====================');
    
    Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.replace('_', ' ').charAt(0).toUpperCase() + test.replace('_', ' ').slice(1)}`);
    });
    
    const allPassed = Object.values(testResults).every(result => result === true);
    
    if (allPassed) {
        console.log('\n🎉 VOICE SYSTEM WORKING!');
        console.log('🗣️ JARVIS can now speak and respond with voice!');
    } else {
        console.log('\n⚠️ Some voice features need attention');
    }
    
    socket.disconnect();
    process.exit(allPassed ? 0 : 1);
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
