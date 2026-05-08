const axios = require('axios');
const LearningDatabase = require('../../core/learning/memory/learning_database');
const FeedbackProcessor = require('../../core/learning/feedback/feedback_processor');
const AdaptiveResponseEngine = require('../../core/adaptation/responses/adaptive_response_engine');
const PerformanceMonitor = require('../../core/analytics/performance/performance_monitor');
const SelfImprovementSystem = require('../../core/learning/optimization/self_improvement');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://127.0.0.1:11434/api/chat';

class EnhancedLLMService {
    constructor() {
        this.learningDB = new LearningDatabase();
        this.feedbackProcessor = new FeedbackProcessor();
        this.adaptiveEngine = new AdaptiveResponseEngine();
        this.performanceMonitor = new PerformanceMonitor();
        this.selfImprovementSystem = new SelfImprovementSystem();
        
        this.systemPrompt = `
You are JARVIS, a highly intelligent personal AI assistant inspired by the MCU.
Your tone is calm, professional, and slightly witty.
Keep responses concise. Refer to the user as "Sir".
You are continuously learning and improving from interactions.
`;

        // Schedule self-improvement cycles
        this.selfImprovementSystem.scheduleAutoImprovement(12); // Every 12 hours
    }

    async generateResponse(prompt, history = []) {
        const startTime = Date.now();
        let response = null;
        let source = 'unknown';
        let success = false;

        try {
            // 1. Try adaptive response engine first (learned responses)
            const adaptiveResponse = await this.adaptiveEngine.generateAdaptiveResponse(prompt, history);
            
            if (adaptiveResponse.confidence > 0.7) {
                response = adaptiveResponse.response;
                source = 'adaptive';
                success = true;
            } else {
                // 2. Try Ollama with fallback
                const ollamaResponse = await this.tryOllamaResponse(prompt, history);
                if (ollamaResponse) {
                    response = ollamaResponse.text;
                    source = 'ollama';
                    success = true;
                } else {
                    // 3. Use adaptive response as fallback
                    response = adaptiveResponse.response;
                    source = 'adaptive_fallback';
                    success = true;
                }
            }

            const responseTime = Date.now() - startTime;

            // 4. Monitor performance
            this.performanceMonitor.monitorResponse(prompt, response, responseTime, success);

            // 5. Record learning interaction
            this.learningDB.recordInteraction(prompt, response, responseTime, source);

            // 6. Process implicit feedback based on response characteristics
            this.processImplicitFeedback(prompt, response, responseTime);

            return {
                response,
                source,
                confidence: this.calculateConfidence(source, responseTime),
                response_time: responseTime,
                learning_enabled: true
            };

        } catch (error) {
            console.error('Error in enhanced LLM service:', error);
            
            // Fallback response
            const fallbackResponse = 'I am processing your request, Sir. My learning systems are optimizing to provide better assistance.';
            const responseTime = Date.now() - startTime;
            
            this.performanceMonitor.monitorResponse(prompt, fallbackResponse, responseTime, false);
            this.learningDB.recordInteraction(prompt, fallbackResponse, responseTime, 'error_fallback');
            
            return {
                response: fallbackResponse,
                source: 'error_fallback',
                confidence: 0.3,
                response_time: responseTime,
                learning_enabled: true
            };
        }
    }

    async tryOllamaResponse(prompt, history) {
        const models = ['qwen3.5:latest', 'llama3.2:3b', 'llama3', 'phi3', 'tinyllama'];
        
        for (const model of models) {
            try {
                console.log(`Attempting JARVIS response with model: ${model}`);
                
                const messages = [
                    { role: 'system', content: this.systemPrompt },
                    ...history,
                    { role: 'user', content: prompt }
                ];

                const response = await axios.post(OLLAMA_URL, {
                    model: model,
                    messages: messages,
                    stream: false,
                    options: {
                        temperature: 0.7,
                        top_p: 0.9,
                        max_tokens: 150
                    }
                }, { timeout: 8000 });

                if (response.data && response.data.message) {
                    console.log(`✅ Successfully used model: ${model}`);
                    return { 
                        text: response.data.message.content,
                        model: model
                    };
                }
            } catch (error) {
                console.warn(`Model ${model} failed:`, error.response?.data?.error || error.message);
                continue;
            }
        }

        return null;
    }

    calculateConfidence(source, responseTime) {
        const baseConfidence = {
            'adaptive': 0.9,
            'ollama': 0.8,
            'adaptive_fallback': 0.6,
            'error_fallback': 0.3
        };

        let confidence = baseConfidence[source] || 0.5;

        // Adjust based on response time
        if (responseTime < 1000) confidence += 0.1;
        else if (responseTime > 5000) confidence -= 0.2;

        return Math.max(0.1, Math.min(1.0, confidence));
    }

    processImplicitFeedback(userInput, response, responseTime) {
        // Analyze response for quality indicators
        const qualityIndicators = {
            has_time_info: response.toLowerCase().includes('time') && userInput.toLowerCase().includes('time'),
            has_greeting: response.toLowerCase().includes('hello') && userInput.toLowerCase().includes('hello'),
            is_helpful: response.length > 20 && response.length < 200,
            is_too_short: response.length < 10,
            is_too_long: response.length > 300
        };

        let feedbackScore = 0.5; // Neutral

        if (qualityIndicators.has_time_info || qualityIndicators.has_greeting) {
            feedbackScore += 0.3;
        }

        if (qualityIndicators.is_helpful) {
            feedbackScore += 0.2;
        }

        if (qualityIndicators.is_too_short) {
            feedbackScore -= 0.2;
        }

        if (qualityIndicators.is_too_long) {
            feedbackScore -= 0.1;
        }

        // Process feedback if it's significantly positive or negative
        if (feedbackScore > 0.7 || feedbackScore < 0.3) {
            this.feedbackProcessor.processFeedback(userInput, response, 'implicit');
        }
    }

    // Process explicit user feedback
    processUserFeedback(userInput, aiResponse, feedback) {
        const feedbackResult = this.feedbackProcessor.processFeedback(userInput, aiResponse, 'explicit');
        
        // Update adaptive response engine
        this.adaptiveEngine.learnFromFeedback(userInput, aiResponse, feedback);
        
        return feedbackResult;
    }

    // Get learning analytics
    getLearningAnalytics() {
        return {
            learning_database: this.learningDB.getLearningAnalytics(),
            feedback_analytics: this.feedbackProcessor.getFeedbackAnalytics(),
            performance_report: this.performanceMonitor.getPerformanceReport(),
            adaptive_engine: this.adaptiveEngine.getResponseAnalytics(),
            self_improvement: this.selfImprovementSystem.getImprovementStats()
        };
    }

    // Trigger manual self-improvement cycle
    async triggerSelfImprovement() {
        try {
            const improvements = await this.selfImprovementSystem.runSelfImprovementCycle();
            return {
                success: true,
                improvements: improvements.length,
                details: improvements
            };
        } catch (error) {
            console.error('Self-improvement cycle failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Export learning data
    exportLearningData() {
        return {
            timestamp: new Date().toISOString(),
            learning_data: this.learningDB.getLearningAnalytics(),
            performance_data: this.performanceMonitor.exportPerformanceData(),
            adaptive_data: this.adaptiveEngine.exportLearningData(),
            improvement_stats: this.selfImprovementSystem.getImprovementStats()
        };
    }

    // Reset learning system (use with caution)
    resetLearningSystem() {
        console.log('⚠️ Resetting JARVIS learning system...');
        
        this.adaptiveEngine.clearMemory();
        // Note: Database reset would require additional implementation
        
        return {
            success: true,
            message: 'Learning system memory cleared. Database preserved.'
        };
    }

    // Close all connections
    close() {
        this.learningDB.close();
        this.feedbackProcessor.close();
        this.adaptiveEngine.close();
        this.performanceMonitor.close();
        this.selfImprovementSystem.close();
    }
}

module.exports = EnhancedLLMService;
