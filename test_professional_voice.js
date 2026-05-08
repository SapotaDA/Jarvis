const io = require('socket.io-client');

console.log('🎤 Testing JARVIS Professional Voice System');
console.log('==========================================');

const socket = io('http://localhost:3001');

const professionalTests = [
    // Test HTML tag removal
    '<h1>Hello Sir</h1>',
    '<p>System status: <strong>Operational</strong></p>',
    'Check **CPU** usage and *memory* status',
    
    // Test technical symbol removal
    'CPU/GPU usage at 80%',
    'Visit https://example.com for more info',
    'Email support@example.com for help',
    
    // Test professional language
    'System is working great!',
    'I can do that stuff for you',
    'Yeah, that\'s cool',
    
    // Test normal responses
    'system info',
    'latest news',
    'how are you'
];

let currentTest = 0;
let testResults = {
    html_filtering: false,
    symbol_filtering: false,
    professional_language: false,
    natural_speech: false,
    overall_quality: false
};

socket.on('connect', () => {
    console.log('✅ Connected to JARVIS Professional Backend');
    console.log('🎤 Starting Professional Voice Tests...\n');
    
    setTimeout(() => {
        runProfessionalTests();
    }, 1000);
});

socket.on('response', (data) => {
    console.log(`🤖 JARVIS [${data.source || 'unknown'}]:`);
    console.log(`   "${data.text}"`);
    
    if (data.voice_enabled) {
        console.log('   🎤 Voice: ENABLED');
    }
    
    // Analyze professional speech quality
    analyzeProfessionalResponse(professionalTests[currentTest - 1], data.text);
    
    setTimeout(() => {
        currentTest++;
        if (currentTest < professionalTests.length) {
            runNextTest();
        } else {
            completeProfessionalTests();
        }
    }, 2000);
});

function analyzeProfessionalResponse(testInput, response) {
    const responseLower = response.toLowerCase();
    
    // Test HTML tag removal
    if (testInput.includes('<') && testInput.includes('>')) {
        if (!responseLower.includes('<') && !responseLower.includes('>')) {
            testResults.html_filtering = true;
            console.log('   ✅ HTML Tag Filtering: PASSED');
        } else {
            console.log('   ❌ HTML Tag Filtering: FAILED');
        }
    }
    
    // Test symbol filtering
    if (testInput.includes('/') || testInput.includes('https') || testInput.includes('@')) {
        if (!responseLower.includes('/') && !responseLower.includes('http') && !responseLower.includes('@')) {
            testResults.symbol_filtering = true;
            console.log('   ✅ Symbol Filtering: PASSED');
        } else {
            console.log('   ❌ Symbol Filtering: FAILED');
        }
    }
    
    // Test professional language
    if (testInput.includes('great') || testInput.includes('stuff') || testInput.includes('cool') || testInput.includes('yeah')) {
        if (responseLower.includes('excellent') || responseLower.includes('outstanding') || responseLower.includes('certainly') || responseLower.includes('yes')) {
            testResults.professional_language = true;
            console.log('   ✅ Professional Language: PASSED');
        } else {
            console.log('   ❌ Professional Language: FAILED');
        }
    }
    
    // Test natural speech quality
    if (response.length > 0 && response.match(/^[A-Z]/) && response.match(/[.!?]$/)) {
        testResults.natural_speech = true;
        console.log('   ✅ Natural Speech Quality: PASSED');
    } else {
        console.log('   ❌ Natural Speech Quality: FAILED');
    }
    
    console.log('   📝 Response Quality Check:');
    console.log(`      - Length: ${response.length} characters`);
    console.log(`      - Starts with capital: ${response.match(/^[A-Z]/) ? 'Yes' : 'No'}`);
    console.log(`      - Ends with punctuation: ${response.match(/[.!?]$/) ? 'Yes' : 'No'}`);
    console.log(`      - Contains HTML: ${response.includes('<') || response.includes('>') ? 'Yes' : 'No'}`);
    console.log(`      - Contains symbols: ${response.includes('/') || response.includes('@') || response.includes('http') ? 'Yes' : 'No'}`);
}

function runProfessionalTests() {
    runNextTest();
}

function runNextTest() {
    const test = professionalTests[currentTest];
    console.log(`🎤 Test ${currentTest + 1}/${professionalTests.length}: "${test}"`);
    socket.emit('command', { text: test });
}

function completeProfessionalTests() {
    console.log('\n🎯 Professional Voice Test Results:');
    console.log('====================================');
    
    Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.replace('_', ' ').charAt(0).toUpperCase() + test.replace('_', ' ').slice(1)}`);
    });
    
    testResults.overall_quality = Object.values(testResults).every(result => result === true);
    
    console.log('\n🚀 Professional Voice Features Status:');
    console.log('=====================================');
    
    if (testResults.overall_quality) {
        console.log('🎉 PROFESSIONAL VOICE SYSTEM WORKING PERFECTLY!');
        console.log('\n🎤 Voice Processing Features:');
        console.log('   ✅ HTML tag removal and filtering');
        console.log('   ✅ Technical symbol processing');
        console.log('   ✅ Professional language conversion');
        console.log('   ✅ Natural speech formatting');
        console.log('   ✅ Context-aware responses');
        console.log('   ✅ Proper punctuation and grammar');
        
        console.log('\n🗣️ Speech Quality Improvements:');
        console.log('   ✅ No more HTML tags spoken aloud');
        console.log('   ✅ No more technical symbols spoken');
        console.log('   ✅ Professional vocabulary used');
        console.log('   ✅ Natural sentence structure');
        console.log('   ✅ Proper capitalization and punctuation');
        console.log('   ✅ Context-appropriate responses');
        
        console.log('\n🎯 JARVIS Voice System Status:');
        console.log('   🎤 Professional Speech: ACTIVE');
        console.log('   🧠 Natural Language: OPTIMIZED');
        console.log('   🔧 Symbol Filtering: ENABLED');
        console.log('   📝 Grammar Processing: ACTIVE');
        console.log('   🎭 Professional Tone: ENABLED');
        
        console.log('\n🎉 Your JARVIS AI now speaks like a professional assistant!');
        console.log('🗣️ No more HTML tags, symbols, or unprofessional language!');
        console.log('🎯 Natural, professional, and context-aware speech is now active!');
        
    } else {
        console.log('⚠️  Some professional voice features need attention');
        console.log('🔧 Check the failed tests and ensure professional speech processing is working');
    }
    
    console.log('\n📊 Professional Voice Statistics:');
    console.log(`   Tests Run: ${professionalTests.length}`);
    console.log(`   HTML Filtering: ${testResults.html_filtering ? 'WORKING' : 'NEEDS ATTENTION'}`);
    console.log(`   Symbol Filtering: ${testResults.symbol_filtering ? 'WORKING' : 'NEEDS ATTENTION'}`);
    console.log(`   Professional Language: ${testResults.professional_language ? 'ACTIVE' : 'NEEDS ATTENTION'}`);
    console.log(`   Natural Speech: ${testResults.natural_speech ? 'ACTIVE' : 'NEEDS ATTENTION'}`);
    console.log(`   Overall Quality: ${testResults.overall_quality ? 'EXCELLENT' : 'NEEDS IMPROVEMENT'}`);
    
    socket.disconnect();
    process.exit(testResults.overall_quality ? 0 : 1);
}

socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('❌ Professional voice test timed out');
    socket.disconnect();
    process.exit(1);
}, 60000);
