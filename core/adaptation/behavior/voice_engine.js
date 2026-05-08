const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class VoiceEngine {
    constructor() {
        this.voiceSettings = {
            enabled: true,
            rate: 1.0,
            volume: 0.8,
            pitch: 1.0,
            voice: 'default',
            language: 'en-US'
        };
        
        this.isSpeaking = false;
        this.speechQueue = [];
        this.audioCache = new Map();
        this.maxCacheSize = 50;
        
        // Initialize voice system
        this.initializeVoiceSystem();
    }

    initializeVoiceSystem() {
        try {
            // Check for available TTS engines
            this.detectAvailableEngines();
            console.log('🎤 JARVIS Voice Engine initialized');
        } catch (error) {
            console.error('Voice Engine initialization failed:', error);
            this.voiceSettings.enabled = false;
        }
    }

    detectAvailableEngines() {
        this.availableEngines = {
            windows: this.checkWindowsTTS(),
            piper: this.checkPiperTTS(),
            edge: this.checkEdgeTTS(),
            fallback: true
        };
        
        // Select best available engine
        this.selectedEngine = this.selectBestEngine();
        console.log(`🎤 Selected TTS engine: ${this.selectedEngine}`);
    }

    checkWindowsTTS() {
        try {
            // Check if running on Windows
            if (process.platform === 'win32') {
                // Test Windows SAPI
                const testScript = `
                    $sapi = New-Object -ComObject SAPI.SpVoice;
                    $sapi.Speak("test", 0);
                `;
                return true;
            }
        } catch (error) {
            return false;
        }
        return false;
    }

    checkPiperTTS() {
        try {
            // Check if Piper TTS is available
            const piperPath = path.join(__dirname, '../../../../ai_services/venv/Scripts/piper.exe');
            return fs.existsSync(piperPath);
        } catch (error) {
            return false;
        }
    }

    checkEdgeTTS() {
        try {
            // Check if Edge TTS is available
            return require.resolve('edge-tts') !== null;
        } catch (error) {
            return false;
        }
    }

    selectBestEngine() {
        if (this.availableEngines.windows) return 'windows';
        if (this.availableEngines.piper) return 'piper';
        if (this.availableEngines.edge) return 'edge';
        return 'fallback';
    }

    // Main text-to-speech function
    async speak(text, options = {}) {
        if (!this.voiceSettings.enabled) {
            console.log(`🤖 JARVIS (text): ${text}`);
            return { success: true, method: 'text' };
        }

        if (this.isSpeaking) {
            // Add to queue if currently speaking
            this.speechQueue.push({ text, options });
            return { success: true, queued: true };
        }

        try {
            this.isSpeaking = true;
            
            // Process text for natural speech
            const processedText = this.processTextForSpeech(text);
            
            // Generate speech using selected engine
            const result = await this.generateSpeech(processedText, options);
            
            this.isSpeaking = false;
            
            // Process next item in queue
            if (this.speechQueue.length > 0) {
                const next = this.speechQueue.shift();
                setTimeout(() => this.speak(next.text, next.options), 100);
            }
            
            return result;
            
        } catch (error) {
            console.error('Speech generation failed:', error);
            this.isSpeaking = false;
            return { success: false, error: error.message };
        }
    }

    processTextForSpeech(text) {
        // Add natural pauses and emphasis
        let processed = text;
        
        // Add pauses for punctuation
        processed = processed.replace(/\./g, '. <pause>');
        processed = processed.replace(/\?/g, '? <pause>');
        processed = processed.replace(/!/g, '! <pause>');
        processed = processed.replace(/,/g, ', <short-pause>');
        
        // Add emphasis for JARVIS-style responses
        if (processed.includes('Sir')) {
            processed = processed.replace(/Sir/g, '<emphasis>Sir</emphasis>');
        }
        
        // Handle abbreviations
        processed = processed.replace(/JARVIS/g, 'JARVIS');
        processed = processed.replace(/AI/g, 'A.I');
        processed = processed.replace(/etc/g, 'et cetera');
        
        // Handle numbers
        processed = processed.replace(/\b(\d{1,2}):(\d{2})\b/g, (match, hours, minutes) => {
            const h = parseInt(hours);
            const m = parseInt(minutes);
            const period = h < 12 ? 'A M' : 'P M';
            const displayHours = h === 0 ? 12 : h > 12 ? h - 12 : h;
            return `${displayHours} ${m} ${period}`;
        });
        
        return processed;
    }

    async generateSpeech(text, options = {}) {
        switch (this.selectedEngine) {
            case 'windows':
                return await this.speakWindows(text, options);
            case 'piper':
                return await this.speakPiper(text, options);
            case 'edge':
                return await this.speakEdge(text, options);
            default:
                return await this.speakFallback(text, options);
        }
    }

    async speakWindows(text, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const escapedText = text.replace(/"/g, '""');
                const psScript = `
                    Add-Type -AssemblyName System.Speech;
                    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
                    $synth.Rate = ${this.voiceSettings.rate * 2};
                    $synth.Volume = ${this.voiceSettings.volume * 100};
                    $synth.SelectVoice("Microsoft David Desktop");
                    $synth.Speak("${escapedText}");
                `;

                const powershell = spawn('powershell.exe', ['-Command', psScript]);
                
                powershell.on('close', (code) => {
                    if (code === 0) {
                        resolve({ success: true, method: 'windows-tts' });
                    } else {
                        reject(new Error('Windows TTS failed'));
                    }
                });
                
                powershell.on('error', (error) => {
                    reject(error);
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    async speakPiper(text, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const piperPath = path.join(__dirname, '../../../../ai_services/venv/Scripts/piper.exe');
                const modelPath = path.join(__dirname, '../../../../ai_services/models/en_US-lessac-medium.onnx');
                const outputPath = path.join(__dirname, '../../../temp/speech.wav');
                
                // Ensure temp directory exists
                const tempDir = path.dirname(outputPath);
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                
                const piper = spawn(piperPath, [
                    '--model', modelPath,
                    '--output_file', outputPath
                ]);
                
                piper.stdin.write(text);
                piper.stdin.end();
                
                piper.on('close', (code) => {
                    if (code === 0 && fs.existsSync(outputPath)) {
                        // Play the generated audio
                        this.playAudioFile(outputPath);
                        resolve({ success: true, method: 'piper-tts' });
                    } else {
                        reject(new Error('Piper TTS failed'));
                    }
                });
                
                piper.on('error', (error) => {
                    reject(error);
                });
                
            } catch (error) {
                reject(error);
            }
        });
    }

    async speakEdge(text, options = {}) {
        try {
            const edgeTTS = require('edge-tts');
            const communicate = edgeTTS.Communicate(text, 'en-US-JennyNeural');
            
            await communicate.save(path.join(__dirname, '../../../temp/speech.mp3'));
            this.playAudioFile(path.join(__dirname, '../../../temp/speech.mp3'));
            
            return { success: true, method: 'edge-tts' };
        } catch (error) {
            throw new Error('Edge TTS not available');
        }
    }

    async speakFallback(text, options = {}) {
        // Fallback: console output with visual indicator
        console.log(`🎤 JARVIS (voice): ${text}`);
        
        // Simulate speech timing
        const speechDuration = text.length * 0.1; // Rough estimate
        await new Promise(resolve => setTimeout(resolve, speechDuration * 1000));
        
        return { success: true, method: 'console' };
    }

    playAudioFile(filePath) {
        try {
            if (process.platform === 'win32') {
                // Windows: use PowerShell to play audio
                spawn('powershell.exe', [
                    '-Command', `(New-Object Media.SoundPlayer '${filePath}').PlaySync()`
                ]);
            } else {
                // Other platforms: use ffplay or similar
                spawn('ffplay', ['-nodisp', '-autoexit', filePath]);
            }
        } catch (error) {
            console.log('Audio playback failed, but speech was generated');
        }
    }

    // Stop current speech
    stop() {
        this.isSpeaking = false;
        this.speechQueue = [];
        console.log('🎤 JARVIS speech stopped');
    }

    // Update voice settings
    updateSettings(settings) {
        this.voiceSettings = { ...this.voiceSettings, ...settings };
        console.log('🎤 Voice settings updated:', settings);
    }

    // Get current voice settings
    getSettings() {
        return { ...this.voiceSettings };
    }

    // Test voice
    async testVoice() {
        const testText = "Hello Sir. JARVIS voice system is online and ready.";
        return await this.speak(testText);
    }

    // Enable/disable voice
    setEnabled(enabled) {
        this.voiceSettings.enabled = enabled;
        console.log(`🎤 Voice ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Clear speech queue
    clearQueue() {
        this.speechQueue = [];
        console.log('🎤 Speech queue cleared');
    }

    // Get speech queue status
    getQueueStatus() {
        return {
            isSpeaking: this.isSpeaking,
            queueLength: this.speechQueue.length,
            queueItems: this.speechQueue.length
        };
    }

    // Add emotion to speech
    async speakWithEmotion(text, emotion = 'neutral') {
        const emotionMap = {
            happy: { rate: 1.1, pitch: 1.2, volume: 0.9 },
            sad: { rate: 0.8, pitch: 0.8, volume: 0.7 },
            excited: { rate: 1.3, pitch: 1.4, volume: 1.0 },
            serious: { rate: 0.9, pitch: 0.9, volume: 0.8 },
            neutral: { rate: 1.0, pitch: 1.0, volume: 0.8 }
        };

        const emotionSettings = emotionMap[emotion] || emotionMap.neutral;
        const originalSettings = { ...this.voiceSettings };
        
        this.updateSettings(emotionSettings);
        const result = await this.speak(text);
        this.updateSettings(originalSettings);
        
        return result;
    }

    // Speak with JARVIS personality
    async speakAsJarvis(text, context = {}) {
        // Add JARVIS-style modifications
        let jarvisText = text;
        
        // Ensure proper address
        if (!jarvisText.includes('Sir') && context.addressUser !== false) {
            jarvisText = jarvisText.replace(/^/, 'Sir, ');
        }
        
        // Add confidence indicators
        if (context.confidence && context.confidence < 0.7) {
            jarvisText = jarvisText.replace(/$/, ' I believe.');
        }
        
        // Add system status for technical responses
        if (context.technical) {
            jarvisText += ' System operational.';
        }
        
        return await this.speakWithEmotion(jarvisText, 'neutral');
    }
}

module.exports = new VoiceEngine();
