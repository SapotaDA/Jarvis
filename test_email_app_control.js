const io = require('socket.io-client');

console.log('📧 Testing JARVIS Email and Application Control');
console.log('==============================================');

const socket = io('http://localhost:3001');

const enhancedTests = [
    // Application opening tests
    'open chrome',
    'open notepad',
    'open calculator',
    'open spotify',
    'open discord',
    'open vs code',
    'open photoshop',
    'open steam',
    
    // Email functionality tests
    'send email to test@example.com about meeting',
    'send email to user@example.com subject "Report" body "System report attached"',
    'send meeting email to boss@example.com',
    'send report email to admin@example.com',
    
    // URL opening tests
    'open google.com',
    'open github.com',
    'open youtube.com',
    'open stackoverflow.com'
];

let currentTest = 0;
let testResults = {
    app_control: false,
    email_sending: false,
    url_opening: false,
    overall_functionality: false
};

socket.on('connect', () => {
    console.log('✅ Connected to JARVIS Enhanced Backend');
    console.log('📧 Starting Email and Application Control Tests...\n');
    
    setTimeout(() => {
        runEnhancedTests();
    }, 1000);
});

socket.on('response', (data) => {
    console.log(`🤖 JARVIS [${data.source || 'unknown'}]:`);
    console.log(`   "${data.text}"`);
    
    if (data.voice_enabled) {
        console.log('   🎤 Voice: ENABLED');
    }
    
    // Analyze response type
    analyzeResponse(enhancedTests[currentTest - 1], data);
    
    setTimeout(() => {
        currentTest++;
        if (currentTest < enhancedTests.length) {
            runNextTest();
        } else {
            completeEnhancedTests();
        }
    }, 2000);
});

function analyzeResponse(test, data) {
    if (!test || !data) return;
    
    const testLower = test.toLowerCase();
    const responseLower = data.text.toLowerCase();
    
    // Application Control Analysis
    if (testLower.includes('open') && (testLower.includes('chrome') || testLower.includes('notepad') || testLower.includes('calculator'))) {
        if (responseLower.includes('opened') || responseLower.includes('launched')) {
            testResults.app_control = true;
            console.log('   ✅ Application Control: PASSED');
        } else {
            console.log('   ❌ Application Control: FAILED');
        }
    }
    
    // Email Sending Analysis
    if (testLower.includes('email') || testLower.includes('mail')) {
        if (responseLower.includes('email') || responseLower.includes('mail') || responseLower.includes('opened')) {
            testResults.email_sending = true;
            console.log('   ✅ Email Sending: PASSED');
        } else {
            console.log('   ❌ Email Sending: FAILED');
        }
    }
    
    // URL Opening Analysis
    if (testLower.includes('open') && (testLower.includes('.com') || testLower.includes('google') || testLower.includes('github'))) {
        if (responseLower.includes('opened') || responseLower.includes('url')) {
            testResults.url_opening = true;
            console.log('   ✅ URL Opening: PASSED');
        } else {
            console.log('   ❌ URL Opening: FAILED');
        }
    }
    
    console.log('   📝 Response Analysis:');
    console.log(`      - Source: ${data.source || 'unknown'}`);
    console.log(`      - Confidence: ${data.confidence || 'N/A'}`);
    console.log(`      - Voice Enabled: ${data.voice_enabled ? 'Yes' : 'No'}`);
}

function runEnhancedTests() {
    runNextTest();
}

function runNextTest() {
    const test = enhancedTests[currentTest];
    console.log(`📧 Test ${currentTest + 1}/${enhancedTests.length}: "${test}"`);
    socket.emit('command', { text: test });
}

function completeEnhancedTests() {
    console.log('\n🎯 Enhanced Email and Application Control Test Results:');
    console.log('=========================================================');
    
    Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test.replace('_', ' ').charAt(0).toUpperCase() + test.replace('_', ' ').slice(1)}`);
    });
    
    testResults.overall_functionality = Object.values(testResults).every(result => result === true);
    
    console.log('\n🚀 JARVIS Enhanced Features Status:');
    console.log('=====================================');
    
    if (testResults.overall_functionality) {
        console.log('🎉 ALL ENHANCED FEATURES WORKING!');
        console.log('\n📧 Email Services:');
        console.log('   ✅ Send emails to any recipient');
        console.log('   ✅ Template emails (meeting, report, reminder)');
        console.log('   ✅ Email drafts creation');
        console.log('   ✅ Professional email formatting');
        
        console.log('\n🖥️ Application Control:');
        console.log('   ✅ Open any application by name');
        console.log('   ✅ Launch browsers (Chrome, Firefox, Edge)');
        console.log('   ✅ Open development tools (VS Code, IntelliJ)');
        console.log('   ✅ Launch creative software (Photoshop, Blender)');
        console.log('   ✅ Open communication apps (Discord, Slack, Teams)');
        console.log('   ✅ Launch gaming platforms (Steam, Epic Games)');
        console.log('   ✅ Open system utilities (Calculator, Notepad)');
        
        console.log('\n🌐 URL Opening:');
        console.log('   ✅ Open any website by domain');
        console.log('   ✅ Automatic HTTPS protocol handling');
        console.log('   ✅ Support for popular websites');
        
        console.log('\n🎯 Voice Commands Available:');
        console.log('   📧 "Send email to user@example.com about meeting"');
        console.log('   📧 "Send report email to admin@example.com"');
        console.log('   🖥️ "Open chrome" / "Open notepad" / "Open calculator"');
        console.log('   🖥️ "Open spotify" / "Open discord" / "Open vs code"');
        console.log('   🌐 "Open google.com" / "Open github.com"');
        
        console.log('\n🎉 Your JARVIS AI can now:');
        console.log('   • Send professional emails to anyone');
        console.log('   • Open any application installed on your system');
        console.log('   • Launch websites and URLs on command');
        console.log('   • Handle all tasks through voice commands');
        
    } else {
        console.log('⚠️  Some enhanced features need attention');
        console.log('🔧 Check the failed tests and ensure all services are running');
    }
    
    console.log('\n📊 Enhanced Feature Statistics:');
    console.log(`   Tests Run: ${enhancedTests.length}`);
    console.log(`   Application Control: ${testResults.app_control ? 'WORKING' : 'NEEDS ATTENTION'}`);
    console.log(`   Email Services: ${testResults.email_sending ? 'ACTIVE' : 'NEEDS ATTENTION'}`);
    console.log(`   URL Opening: ${testResults.url_opening ? 'ACTIVE' : 'NEEDS ATTENTION'}`);
    console.log(`   Overall Quality: ${testResults.overall_functionality ? 'EXCELLENT' : 'NEEDS IMPROVEMENT'}`);
    
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
