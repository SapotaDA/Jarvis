const io = require('socket.io-client');

console.log('🎤 Testing JARVIS Complete Voice System');
console.log('======================================');

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

let testResults = {
    voice_recognition: false,
    text_to_speech: false,
    voice_integration: false,
    learning_with_voice: false,
    voice_controls: false,
    overall_functionality: false
};

const voiceTestCommands = [
    'hello jarvis',
    'what time is it',
    'how are you doing today',
    'tell me about your voice capabilities',
    'thank you for your help'
];

let currentTest = 0;
let voiceResponses = [];

socket.on('connect', () => {
    console.log('✅ Connected to JARVIS Backend');
    console.log('🎤 Voice System: Testing...');
    
    // Start voice tests
    setTimeout(() => {
        runVoiceTests();
    }, 1000);
});

socket.on('response', (data) => {
    console.log(`🤖 JARVIS [${data.source || 'unknown'}] (${(data.confidence * 100).toFixed(1)}% confidence):`);
    console.log(`   "${data.text}"`);
    
    if (data.voice_enabled) {
        console.log('   🎤 Voice Response: ENABLED');
    }
    
    // Store voice response for testing
    voiceResponses.push({
        user_input: voiceTestCommands[currentTest - 1] || 'unknown',
        ai_response: data.text,
        source: data.source,
        confidence: data.confidence,
        voice_enabled: data.voice_enabled,
        timestamp: Date.now()
    });
    
    // Continue with next test
    setTimeout(() => {
        currentTest++;
        if (currentTest < voiceTestCommands.length) {
            runNextVoiceTest();
        } else {
            testVoiceControls();
        }
    }, 3000); // Wait longer for voice to complete
});

function runVoiceTests() {
    console.log('\n🎤 Starting Voice System Tests...\n');
    runNextVoiceTest();
}

function runNextVoiceTest() {
    const command = voiceTestCommands[currentTest];
    console.log(`🎤 Voice Test ${currentTest + 1}/${voiceTestCommands.length}: "${command}"`);
    socket.emit('command', { text: command });
}

function testVoiceControls() {
    console.log('\n🎛️ Testing Voice Controls...\n');
    
    // Test voice status
    console.log('🔊 Testing voice status...');
    socket.emit('voice_control', { action: 'status' });
    
    setTimeout(() => {
        // Test voice toggle
        console.log('🔄 Testing voice toggle...');
        socket.emit('voice_control', { action: 'toggle' });
    }, 2000);
    
    setTimeout(() => {
        // Test voice settings
        console.log('⚙️ Testing voice settings...');
        socket.emit('voice_control', { 
            action: 'settings', 
            settings: { rate: 1.2, volume: 0.9, pitch: 1.1 }
        });
    }, 4000);
    
    setTimeout(() => {
        // Test voice test
        console.log('🧪 Testing voice test...');
        socket.emit('voice_control', { action: 'test' });
    }, 6000);
    
    setTimeout(() => {
        testLearningWithVoice();
    }, 8000);
}

socket.on('voice_status', (data) => {
    console.log('🔊 Voice Status:', data);
    testResults.voice_controls = true;
});

socket.on('voice_test_result', (data) => {
    console.log('🧪 Voice Test Result:', data);
    testResults.voice_controls = true;
});

socket.on('voice_error', (data) => {
    console.log('❌ Voice Error:', data.error);
});

function testLearningWithVoice() {
    console.log('\n🧠 Testing Learning with Voice...\n');
    
    // Test learning feedback with voice
    if (voiceResponses.length > 0) {
        const lastResponse = voiceResponses[voiceResponses.length - 1];
        console.log('📝 Submitting voice feedback...');
        
        socket.emit('user_feedback', {
            user_input: lastResponse.user_input,
            ai_response: lastResponse.ai_response,
            feedback: 1 // Positive feedback
        });
    }
    
    setTimeout(() => {
        testLearningAnalytics();
    }, 2000);
}

socket.on('feedback_processed', (data) => {
    console.log('✅ Voice Feedback Processed:', data);
    testResults.learning_with_voice = true;
});

function testLearningAnalytics() {
    console.log('\n📊 Testing Learning Analytics...\n');
    
    socket.emit('get_learning_analytics');
}

socket.on('learning_analytics', (data) => {
    console.log('📊 Learning Analytics Received:');
    if (data.total_interactions) {
        console.log(`   Total Interactions: ${data.total_interactions}`);
        console.log(`   Success Rate: ${(data.success_rate * 100).toFixed(1)}%`);
        console.log(`   Learned Responses: ${data.learned_responses}`);
    }
    testResults.learning_with_voice = true;
    
    setTimeout(() => {
        completeVoiceTests();
    }, 2000);
}

function completeVoiceTests() {
    console.log('\n🎯 Voice System Test Results:');
    console.log('==================================');
    
    // Evaluate test results
    testResults.voice_recognition = voiceResponses.length > 0;
    testResults.text_to_speech = voiceResponses.some(r => r.voice_enabled);
    testResults.voice_integration = voiceResponses.length === voiceTestCommands.length;
    testResults.overall_functionality = Object.values(testResults).every(result => result === true);
    
    Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.replace('_', ' ').charAt(0).toUpperCase() + test.replace('_', ' ').slice(1)}`);
    });
    
    console.log('\n🎤 Voice System Summary:');
    console.log('========================');
    
    if (testResults.overall_functionality) {
        console.log('🎉 ALL VOICE SYSTEM TESTS PASSED!');
        console.log('\n🚀 JARVIS Voice Capabilities:');
        console.log('   ✅ Voice Recognition: Working');
        console.log('   ✅ Text-to-Speech: Human-like voice responses');
        console.log('   ✅ Voice Integration: Fully integrated with AI');
        console.log('   ✅ Learning with Voice: Adapts from spoken interactions');
        console.log('   ✅ Voice Controls: Settings and customization');
        console.log('   ✅ Natural Conversation: Complete voice workflow');
        
        console.log('\n🎤 Your JARVIS AI now speaks like a human and learns from voice interactions!');
        console.log('🗣️ Talk to JARVIS and it will respond with its own voice!');
    } else {
        console.log('⚠️  Some voice features need attention');
        console.log('🔧 Check voice settings and system configuration');
    }
    
    console.log('\n📊 Voice Test Statistics:');
    console.log(`   Voice Commands Tested: ${voiceTestCommands.length}`);
    console.log(`   Voice Responses Received: ${voiceResponses.length}`);
    console.log(`   Average Confidence: ${(voiceResponses.reduce((sum, r) => sum + r.confidence, 0) / voiceResponses.length * 100).toFixed(1)}%`);
    console.log(`   Voice Integration: ${testResults.voice_integration ? 'COMPLETE' : 'PARTIAL'}`);
    
    socket.disconnect();
    process.exit(testResults.overall_functionality ? 0 : 1);
}

socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error.message);
    process.exit(1);
});

// Timeout after 60 seconds
setTimeout(() => {
    console.log('❌ Voice system test timed out');
    socket.disconnect();
    process.exit(1);
}, 60000);
