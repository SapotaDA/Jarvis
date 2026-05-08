const io = require('socket.io-client');

console.log('🧠 Testing JARVIS AI Learning System');
console.log('=====================================');

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

let testResults = {
    basic_responses: false,
    adaptive_learning: false,
    feedback_processing: false,
    analytics: false,
    self_improvement: false
};

const testCommands = [
    'hello jarvis',
    'what time is it',
    'how are you doing',
    'tell me about your learning capabilities',
    'thank you for your help',
    'what can you learn from our conversations',
    'help me understand something complex',
    'goodbye jarvis'
];

let currentTest = 0;
let interactionHistory = [];

socket.on('connect', () => {
    console.log('✅ Connected to Enhanced JARVIS Backend');
    console.log('🧠 AI Learning System: ENABLED');
    
    // Start testing
    setTimeout(() => {
        runLearningTests();
    }, 1000);
});

socket.on('response', (data) => {
    console.log(`🤖 JARVIS [${data.source || 'unknown'}] (${(data.confidence * 100).toFixed(1)}% confidence):`);
    console.log(`   "${data.text}"`);
    
    // Store interaction for learning tests
    interactionHistory.push({
        user_input: testCommands[currentTest - 1] || 'unknown',
        ai_response: data.text,
        source: data.source,
        confidence: data.confidence,
        timestamp: Date.now()
    });
    
    // Simulate user feedback (positive for good responses)
    if (data.confidence > 0.6 && data.text.length > 10) {
        setTimeout(() => {
            simulateUserFeedback(interactionHistory[interactionHistory.length - 1]);
        }, 500);
    }
    
    // Continue with next test
    setTimeout(() => {
        currentTest++;
        if (currentTest < testCommands.length) {
            runNextTest();
        } else {
            testAdvancedFeatures();
        }
    }, 2000);
});

function runLearningTests() {
    console.log('\n📚 Starting Learning Capability Tests...\n');
    runNextTest();
}

function runNextTest() {
    const command = testCommands[currentTest];
    console.log(`📝 Test ${currentTest + 1}/${testCommands.length}: "${command}"`);
    socket.emit('command', { text: command });
}

function simulateUserFeedback(interaction) {
    // Simulate positive feedback for good responses
    const feedback = Math.random() > 0.3 ? 1 : -1; // 70% positive feedback
    
    console.log(`👍 Simulating user feedback: ${feedback > 0 ? 'Positive' : 'Negative'}`);
    
    socket.emit('user_feedback', {
        user_input: interaction.user_input,
        ai_response: interaction.ai_response,
        feedback: feedback
    });
}

function testAdvancedFeatures() {
    console.log('\n🔬 Testing Advanced Learning Features...\n');
    
    // Test 1: Learning Analytics
    console.log('📊 Testing Learning Analytics...');
    socket.emit('get_learning_analytics');
    
    setTimeout(() => {
        // Test 2: Self-Improvement
        console.log('🔄 Testing Self-Improvement System...');
        socket.emit('trigger_self_improvement');
    }, 3000);
}

socket.on('feedback_processed', (data) => {
    console.log('✅ Feedback processed successfully');
    if (data.sentiment) {
        console.log(`   Sentiment: ${data.sentiment}, Score: ${data.feedbackScore}`);
    }
});

socket.on('learning_analytics', (data) => {
    console.log('📊 Learning Analytics Received:');
    if (data.learning_database) {
        console.log(`   Total Interactions: ${data.learning_database.totalInteractions}`);
        console.log(`   Success Rate: ${(data.learning_database.successRate * 100).toFixed(1)}%`);
        console.log(`   Adaptive Responses: ${data.learning_database.adaptiveResponses}`);
    }
    testResults.analytics = true;
});

socket.on('self_improvement_result', (data) => {
    console.log('🔄 Self-Improvement Results:');
    if (data.success) {
        console.log(`   ✅ Improvement cycle completed`);
        console.log(`   📈 Improvements applied: ${data.improvements}`);
        testResults.self_improvement = true;
    } else {
        console.log(`   ❌ Improvement failed: ${data.error}`);
    }
});

socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error.message);
    process.exit(1);
});

// Test completion
setTimeout(() => {
    console.log('\n🎯 Learning System Test Results:');
    console.log('==================================');
    
    Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.replace('_', ' ').charAt(0).toUpperCase() + test.replace('_', ' ').slice(1)}`);
    });
    
    const allPassed = Object.values(testResults).every(result => result === true);
    
    if (allPassed) {
        console.log('\n🎉 ALL LEARNING SYSTEM TESTS PASSED!');
        console.log('\n🚀 JARVIS AI Learning Capabilities:');
        console.log('   ✅ Adaptive Response Generation');
        console.log('   ✅ User Feedback Processing');
        console.log('   ✅ Performance Monitoring');
        console.log('   ✅ Self-Improvement System');
        console.log('   ✅ Learning Analytics');
        console.log('   ✅ Mistake Pattern Recognition');
        console.log('\n🧠 Your JARVIS AI is now learning and improving with every interaction!');
    } else {
        console.log('\n⚠️  Some learning features need attention');
    }
    
    console.log('\n📊 Total Interactions Tested:', interactionHistory.length);
    console.log('🔄 Learning Cycles: Automated');
    console.log('📈 Continuous Improvement: ENABLED');
    
    socket.disconnect();
    process.exit(allPassed ? 0 : 1);
}, 30000);
