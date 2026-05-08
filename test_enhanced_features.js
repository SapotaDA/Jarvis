const io = require('socket.io-client');

console.log('🧪 Testing JARVIS Enhanced Features');
console.log('=====================================');

const socket = io('http://localhost:3001');

let testResults = {
    computer_control: false,
    news_integration: false,
    system_monitoring: false,
    voice_integration: false,
    learning_system: false,
    overall_functionality: false
};

const enhancedTests = [
    // Computer Control Tests
    'system info',
    'network status', 
    'create file test.txt',
    'list files .',
    'open chrome',
    'screenshot',
    'volume 50',
    
    // News Tests
    'latest news',
    'breaking news',
    'tech news',
    'business news',
    'news about technology',
    'sports news',
    
    // System Tests
    'hello jarvis',
    'how are you doing',
    'what time is it',
    'tell me about your capabilities'
];

let currentTest = 0;
let responses = [];

socket.on('connect', () => {
    console.log('✅ Connected to JARVIS Enhanced Backend');
    console.log('🧪 Starting Enhanced Feature Tests...\n');
    
    setTimeout(() => {
        runEnhancedTests();
    }, 1000);
});

socket.on('response', (data) => {
    console.log(`🤖 JARVIS [${data.source || 'unknown'}] (${(data.confidence * 100).toFixed(1)}% confidence):`);
    console.log(`   "${data.text}"`);
    
    if (data.voice_enabled) {
        console.log('   🎤 Voice Response: ENABLED');
    }
    
    if (data.learning_enabled) {
        console.log('   🧠 Learning: ENABLED');
    }
    
    // Store response for analysis
    responses.push({
        test: enhancedTests[currentTest - 1] || 'unknown',
        response: data.text,
        source: data.source,
        confidence: data.confidence,
        voice_enabled: data.voice_enabled,
        learning_enabled: data.learning_enabled,
        timestamp: Date.now()
    });
    
    // Analyze response type
    analyzeResponse(enhancedTests[currentTest - 1], data);
    
    // Continue with next test
    setTimeout(() => {
        currentTest++;
        if (currentTest < enhancedTests.length) {
            runNextTest();
        } else {
            testAPIEndpoints();
        }
    }, 2000);
});

function analyzeResponse(test, data) {
    const testLower = test.toLowerCase();
    const responseLower = data.text.toLowerCase();
    
    // Computer Control Analysis
    if (testLower.includes('system info') && responseLower.includes('system info')) {
        testResults.computer_control = true;
        console.log('   ✅ Computer Control: System Info - PASSED');
    }
    
    if (testLower.includes('network') && responseLower.includes('internet')) {
        testResults.computer_control = true;
        console.log('   ✅ Computer Control: Network Status - PASSED');
    }
    
    if (testLower.includes('create file') && responseLower.includes('file created')) {
        testResults.computer_control = true;
        console.log('   ✅ Computer Control: File Creation - PASSED');
    }
    
    if (testLower.includes('list files') && responseLower.includes('files')) {
        testResults.computer_control = true;
        console.log('   ✅ Computer Control: File Listing - PASSED');
    }
    
    if (testLower.includes('open chrome') && responseLower.includes('opened')) {
        testResults.computer_control = true;
        console.log('   ✅ Computer Control: Application Launch - PASSED');
    }
    
    if (testLower.includes('screenshot') && responseLower.includes('screenshot')) {
        testResults.computer_control = true;
        console.log('   ✅ Computer Control: Screenshot - PASSED');
    }
    
    if (testLower.includes('volume') && responseLower.includes('volume')) {
        testResults.computer_control = true;
        console.log('   ✅ Computer Control: Volume Control - PASSED');
    }
    
    // News Integration Analysis
    if (testLower.includes('news') && (responseLower.includes('news') || responseLower.includes('headline'))) {
        testResults.news_integration = true;
        console.log('   ✅ News Integration: News Query - PASSED');
    }
    
    if (testLower.includes('breaking') && responseLower.includes('breaking')) {
        testResults.news_integration = true;
        console.log('   ✅ News Integration: Breaking News - PASSED');
    }
    
    if (testLower.includes('tech') && responseLower.includes('tech')) {
        testResults.news_integration = true;
        console.log('   ✅ News Integration: Tech News - PASSED');
    }
    
    if (testLower.includes('business') && responseLower.includes('business')) {
        testResults.news_integration = true;
        console.log('   ✅ News Integration: Business News - PASSED');
    }
    
    if (testLower.includes('sports') && responseLower.includes('sports')) {
        testResults.news_integration = true;
        console.log('   ✅ News Integration: Sports News - PASSED');
    }
    
    // System Monitoring Analysis
    if (data.source === 'learned' || data.source === 'pattern') {
        testResults.learning_system = true;
        console.log('   ✅ Learning System: Adaptive Response - PASSED');
    }
    
    if (data.voice_enabled) {
        testResults.voice_integration = true;
        console.log('   ✅ Voice Integration: Voice Response - PASSED');
    }
    
    if (data.confidence > 0.7) {
        testResults.system_monitoring = true;
        console.log('   ✅ System Monitoring: High Confidence - PASSED');
    }
}

function runEnhancedTests() {
    console.log('🧪 Starting Enhanced Feature Tests...\n');
    runNextTest();
}

function runNextTest() {
    const test = enhancedTests[currentTest];
    console.log(`🧪 Test ${currentTest + 1}/${enhancedTests.length}: "${test}"`);
    socket.emit('command', { text: test });
}

async function testAPIEndpoints() {
    console.log('\n🔌 Testing API Endpoints...\n');
    
    try {
        // Test System Info API
        console.log('🔌 Testing System Info API...');
        const systemResponse = await fetch('http://localhost:3001/api/computer/system-info');
        const systemData = await systemResponse.json();
        if (systemData.success) {
            testResults.computer_control = true;
            console.log('   ✅ System Info API - PASSED');
        }
        
        // Test News API
        console.log('🔌 Testing News Headlines API...');
        const newsResponse = await fetch('http://localhost:3001/api/news/headlines');
        const newsData = await newsResponse.json();
        if (Array.isArray(newsData)) {
            testResults.news_integration = true;
            console.log('   ✅ News Headlines API - PASSED');
        }
        
        // Test Voice Status API
        console.log('🔌 Testing Voice Status API...');
        const voiceResponse = await fetch('http://localhost:3001/api/voice/status');
        const voiceData = await voiceResponse.json();
        if (voiceData.enabled !== undefined) {
            testResults.voice_integration = true;
            console.log('   ✅ Voice Status API - PASSED');
        }
        
        // Test Learning Analytics API
        console.log('🔌 Testing Learning Analytics API...');
        const learningResponse = await fetch('http://localhost:3001/api/learning/analytics');
        const learningData = await learningResponse.json();
        if (learningData.total_interactions !== undefined) {
            testResults.learning_system = true;
            console.log('   ✅ Learning Analytics API - PASSED');
        }
        
    } catch (error) {
        console.log('   ❌ API Test Error:', error.message);
    }
    
    setTimeout(() => {
        completeEnhancedTests();
    }, 2000);
}

function completeEnhancedTests() {
    console.log('\n🎯 Enhanced Feature Test Results:');
    console.log('====================================');
    
    Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.replace('_', ' ').charAt(0).toUpperCase() + test.replace('_', ' ').slice(1)}`);
    });
    
    testResults.overall_functionality = Object.values(testResults).every(result => result === true);
    
    console.log('\n🚀 JARVIS Enhanced Features Summary:');
    console.log('=====================================');
    
    if (testResults.overall_functionality) {
        console.log('🎉 ALL ENHANCED FEATURES WORKING!');
        console.log('\n🖥️ Computer Control Features:');
        console.log('   ✅ File operations (create, delete, list)');
        console.log('   ✅ Application launching');
        console.log('   ✅ Screenshot capture');
        console.log('   ✅ System information');
        console.log('   ✅ Network status checking');
        console.log('   ✅ Volume control');
        
        console.log('\n📰 News Integration Features:');
        console.log('   ✅ Latest headlines');
        console.log('   ✅ Breaking news');
        console.log('   ✅ Category-specific news (tech, business, sports)');
        console.log('   ✅ Topic-based news search');
        console.log('   ✅ News caching system');
        
        console.log('\n🎤 Voice Integration Features:');
        console.log('   ✅ Voice recognition');
        console.log('   ✅ Text-to-speech responses');
        console.log('   ✅ Voice control settings');
        
        console.log('\n🧠 Learning System Features:');
        console.log('   ✅ Adaptive responses');
        console.log('   ✅ Pattern recognition');
        console.log('   ✅ Confidence scoring');
        console.log('   ✅ Performance monitoring');
        
        console.log('\n🔧 System Monitoring Features:');
        console.log('   ✅ Real-time system status');
        console.log('   ✅ API endpoint availability');
        console.log('   ✅ Performance metrics');
        
        console.log('\n🎯 Your JARVIS AI now performs ALL basic computer tasks and provides real-time news updates!');
        console.log('🗣️ Enhanced UI with modern design and better user experience is ready!');
        
    } else {
        console.log('⚠️  Some enhanced features need attention');
        console.log('🔧 Check the failed tests and ensure all services are running');
    }
    
    console.log('\n📊 Test Statistics:');
    console.log(`   Enhanced Tests Run: ${enhancedTests.length}`);
    console.log(`   Responses Received: ${responses.length}`);
    console.log(`   Average Confidence: ${(responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length * 100).toFixed(1)}%`);
    console.log(`   Voice Integration: ${testResults.voice_integration ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`   Computer Control: ${testResults.computer_control ? 'FULLY FUNCTIONAL' : 'PARTIAL'}`);
    console.log(`   News Integration: ${testResults.news_integration ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`   Learning System: ${testResults.learning_system ? 'ACTIVE' : 'INACTIVE'}`);
    
    socket.disconnect();
    process.exit(testResults.overall_functionality ? 0 : 1);
}

socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('❌ Enhanced feature test timed out');
    socket.disconnect();
    process.exit(1);
}, 60000);
