const io = require('socket.io-client');

console.log('🔍 Testing ALL JARVIS Features - Comprehensive Analysis');
console.log('=====================================================');

const socket = io('http://localhost:3001');

const allTests = [
    // Basic functionality
    'hello jarvis',
    'how are you',
    'what time is it',
    
    // Computer control
    'system info',
    'create file test.txt',
    'list files .',
    'open calculator',
    'open notepad',
    'screenshot',
    'network status',
    
    // Email functionality
    'send email to test@example.com about meeting',
    'send report email to admin@example.com',
    
    // News functionality
    'latest news',
    'tech news',
    'business news',
    'news about technology',
    
    // URL opening
    'open google.com',
    'open github.com',
    
    // Professional speech test
    '<h1>Hello Sir</h1>',
    'CPU/GPU usage at 80%',
    'Visit https://example.com for info'
];

let currentTest = 0;
let testResults = {
    basic_functionality: false,
    computer_control: false,
    email_services: false,
    news_integration: false,
    url_opening: false,
    professional_speech: false,
    overall_system: false,
    failed_tests: []
};

socket.on('connect', () => {
    console.log('✅ Connected to JARVIS Backend');
    console.log('🔍 Starting Comprehensive Feature Tests...\n');
    
    setTimeout(() => {
        runAllTests();
    }, 1000);
});

socket.on('response', (data) => {
    console.log(`🤖 JARVIS [${data.source || 'unknown'}]:`);
    console.log(`   "${data.text}"`);
    
    if (data.voice_enabled) {
        console.log('   🎤 Voice: ENABLED');
    }
    
    // Analyze response
    analyzeFeatureTest(allTests[currentTest - 1], data);
    
    setTimeout(() => {
        currentTest++;
        if (currentTest < allTests.length) {
            runNextTest();
        } else {
            completeComprehensiveTest();
        }
    }, 2000);
});

function analyzeFeatureTest(test, data) {
    if (!test || !data) return;
    
    const testLower = test.toLowerCase();
    const responseLower = data.text.toLowerCase();
    
    // Basic functionality
    if (testLower.includes('hello') || testLower.includes('how are you')) {
        if (data.source && (data.source === 'ollama' || data.source === 'learned' || data.source === 'pattern')) {
            testResults.basic_functionality = true;
            console.log('   ✅ Basic Functionality: WORKING');
        } else {
            console.log('   ❌ Basic Functionality: FALLBACK MODE');
        }
    }
    
    // Computer control
    if (testLower.includes('system info') || testLower.includes('create file') || testLower.includes('open calculator')) {
        if (data.source === 'computer_control') {
            testResults.computer_control = true;
            console.log('   ✅ Computer Control: WORKING');
        } else {
            console.log('   ❌ Computer Control: NOT WORKING');
        }
    }
    
    // Email services
    if (testLower.includes('email') || testLower.includes('mail')) {
        if (data.source === 'email') {
            testResults.email_services = true;
            console.log('   ✅ Email Services: WORKING');
        } else {
            console.log('   ❌ Email Services: NOT WORKING');
        }
    }
    
    // News integration
    if (testLower.includes('news') && !testLower.includes('email')) {
        if (data.source === 'news') {
            testResults.news_integration = true;
            console.log('   ✅ News Integration: WORKING');
        } else {
            console.log('   ❌ News Integration: NOT WORKING');
        }
    }
    
    // URL opening
    if (testLower.includes('open') && (testLower.includes('.com') || testLower.includes('google'))) {
        if (responseLower.includes('opened') || responseLower.includes('url')) {
            testResults.url_opening = true;
            console.log('   ✅ URL Opening: WORKING');
        } else {
            console.log('   ❌ URL Opening: NOT WORKING');
        }
    }
    
    // Professional speech
    if (testLower.includes('<') || testLower.includes('/') || testLower.includes('https')) {
        const hasHtmlTags = responseLower.includes('<') || responseLower.includes('>');
        const hasSymbols = responseLower.includes('/') || responseLower.includes('http');
        if (!hasHtmlTags && !hasSymbols) {
            testResults.professional_speech = true;
            console.log('   ✅ Professional Speech: WORKING');
        } else {
            console.log('   ❌ Professional Speech: NOT WORKING');
        }
    }
    
    console.log('   📝 Source: ' + (data.source || 'unknown'));
}

function runAllTests() {
    runNextTest();
}

function runNextTest() {
    const test = allTests[currentTest];
    console.log(`🔍 Test ${currentTest + 1}/${allTests.length}: "${test}"`);
    socket.emit('command', { text: test });
}

function completeComprehensiveTest() {
    console.log('\n🎯 Comprehensive JARVIS Feature Test Results:');
    console.log('==============================================');
    
    Object.entries(testResults).forEach(([test, passed]) => {
        if (test !== 'failed_tests') {
            console.log(`${passed ? '✅' : '❌'} ${test.replace('_', ' ').charAt(0).toUpperCase() + test.replace('_', ' ').slice(1)}`);
        }
    });
    
    testResults.overall_system = Object.values(testResults).filter(v => typeof v === 'boolean').every(result => result === true);
    
    console.log('\n🚀 System Analysis:');
    console.log('==================');
    
    if (testResults.overall_system) {
        console.log('🎉 ALL SYSTEMS OPERATIONAL!');
    } else {
        console.log('⚠️  SOME SYSTEMS NEED ATTENTION');
        
        // Identify what's not working
        const notWorking = [];
        if (!testResults.basic_functionality) notWorking.push('AI/LLM System');
        if (!testResults.computer_control) notWorking.push('Computer Control');
        if (!testResults.email_services) notWorking.push('Email Services');
        if (!testResults.news_integration) notWorking.push('News Integration');
        if (!testResults.url_opening) notWorking.push('URL Opening');
        if (!testResults.professional_speech) notWorking.push('Professional Speech');
        
        console.log('❌ Not Working:', notWorking.join(', '));
    }
    
    console.log('\n📊 Feature Status:');
    console.log(`   Basic AI: ${testResults.basic_functionality ? 'OPERATIONAL' : 'FALLBACK'}`);
    console.log(`   Computer Control: ${testResults.computer_control ? 'WORKING' : 'FAILED'}`);
    console.log(`   Email Services: ${testResults.email_services ? 'WORKING' : 'FAILED'}`);
    console.log(`   News Integration: ${testResults.news_integration ? 'WORKING' : 'FAILED'}`);
    console.log(`   URL Opening: ${testResults.url_opening ? 'WORKING' : 'FAILED'}`);
    console.log(`   Professional Speech: ${testResults.professional_speech ? 'WORKING' : 'FAILED'}`);
    
    socket.disconnect();
    process.exit(testResults.overall_system ? 0 : 1);
}

socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error.message);
    testResults.overall_system = false;
    process.exit(1);
});

setTimeout(() => {
    console.log('❌ Comprehensive test timed out');
    socket.disconnect();
    process.exit(1);
}, 120000);
